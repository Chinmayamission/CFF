import uuid
from decimal import Decimal
import datetime
from pydash.objects import pick, get, unset
from ..util.formSubmit.util import calculate_price
from ..util.formSubmit.couponCodes import coupon_code_verify_max_and_record_as_used
from ..util.formSubmit.emailer import send_confirmation_email
from ..util.formSubmit.responseHandler import response_verify_update


def form_response_new(formId, responseId=None):
  from ..main import app, TABLES
  newResponse = False
  if not responseId:
      responseId = str(uuid.uuid4())
      newResponse = True
  
  response_data = app.current_request.json_body["data"]
  modifyLink = app.current_request.json_body['modifyLink']
  form = TABLES.forms.get_item(
      Key=dict(id=formId, version=1),
      ProjectionExpression="#schema, schemaModifier, couponCodes, cff_permissions",
      ExpressionAttributeNames={"#schema": "schema"}
    )["Item"]
  schemaModifier = TABLES.schemaModifiers.get_item(
      Key=form["schemaModifier"]
    )["Item"]
  paymentInfo = pick(schemaModifier['paymentInfo'], ["currency", "items", "redirectUrl", "total"])
  confirmationEmailInfo = schemaModifier['confirmationEmailInfo']

  def calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo):
    paymentInfoItem['amount'] = Decimal(calculate_price(paymentInfoItem.get('amount', '0'), response_data))
    paymentInfoItem['quantity'] = Decimal(calculate_price(paymentInfoItem.get('quantity', '0'), response_data))
    paymentInfo['total'] += paymentInfoItem['amount'] * paymentInfoItem['quantity']
  paymentInfoItemsWithTotal = []
  paymentInfo['total'] = 0
  for paymentInfoItem in paymentInfo['items']:
      paymentInfoItem.setdefault("name", "Payment Item")
      paymentInfoItem.setdefault("description", "Payment Item")
      paymentInfoItem.setdefault("quantity", "1")
      if "$total" in paymentInfoItem.get("amount", "0") or "$total" in paymentInfoItem.get("quantity", "0"):
          # Take care of this at the end.
          paymentInfoItemsWithTotal.append(paymentInfoItem)
          continue
      calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo)

  # Now take care of items for round off, etc. -- which need the total value to work.
  response_data["total"] = float(paymentInfo["total"])
  for paymentInfoItem in paymentInfoItemsWithTotal:
      calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo)

  # Redeem coupon codes.
  if "couponCode" in response_data and response_data["couponCode"]:
      couponCode = response_data["couponCode"]
      if "couponCodes" in form and couponCode in form["couponCodes"]:
          coupon_paymentInfoItem = {
              "amount": form["couponCodes"][couponCode].get("amount", "0"),
              "quantity": form["couponCodes"][couponCode].get("quantity", "1"),
              "name": form["couponCodes"][couponCode].get("name", "Coupon Code"),
              "description": form["couponCodes"][couponCode].get("description", "Coupon Code")
          }
          calc_item_total_to_paymentInfo(coupon_paymentInfoItem, paymentInfo)
          paymentInfo['items'].append(coupon_paymentInfoItem)
      else:
          return {"success": False, "message": "Coupon Code not found.", "fields_to_clear": ["couponCode"]}
      # verify max # of coupons:
      code_valid, code_num_remaining = coupon_code_verify_max_and_record_as_used(TABLES.forms, form, couponCode, responseId, response_data)
      if not code_valid:
          message = "Coupon code maximum reached.\nSubmitting this form will cause you to exceed the coupon code maximum.\nNumber of spots remaining: {}".format(code_num_remaining)
          return {"success": False, "message": message, "fields_to_clear": ["couponCode"]}
  else:
      response_data.pop("couponCode", None)
  response_data.pop("total", None)

  paymentInfo['items'] = [item for item in paymentInfo['items'] if item['quantity'] * item['amount'] != 0]
  if newResponse:
      paid = paymentInfo["total"] == 0
      response = {
          "formId": formId, # partition key
          "responseId": responseId, # sort key
          "modifyLink": modifyLink,
          "value": response_data,
          "date_last_modified": datetime.datetime.now().isoformat(),
          "date_created": datetime.datetime.now().isoformat(),
          "form": {
                'id': formId,
                'version': 1
          }, # id, version.
          "paymentInfo": paymentInfo,
          "PAID": paid
      }
      # todo: make manual entry work on update, too.
      # todo: rewrite manual entry.
    #   if schemaModifier["paymentInfo"].get("manualEntry", {}).get("enabled", False) == True:
    #       manualEntryMethodPath = schemaModifier["paymentInfo"]["manualEntry"].get("inputPath", "manualEntry")
    #       manualEntryMethodName = get(response["value"], manualEntryMethodPath)
    #       unset(response["value"], manualEntryMethodPath)
    #       if manualEntryMethodName and authKey in get(form, "cff:permissions.manualEntry", []):
    #           paid = True
    #           response["PAID"] = True
    #           response["IPN_TOTAL_AMOUNT"] = paymentInfo["total"]
    #           response["PAYMENT_HISTORY"] = [{
    #               "amount": Decimal(paymentInfo["total"]),
    #               "currency": "USD", # todo fix.
    #               "date": datetime.datetime.now().isoformat(),
    #               "method": "cff:manualEntry:" + manualEntryMethodName
    #           }]
      TABLES.responses.put_item(
          Item=response)
      if paid: # If total amount is zero (user uses coupon code to get for free)
          send_confirmation_email(response, confirmationEmailInfo)
      return {"paid": paid, "success": True, "action": "insert", "id": responseId, "paymentInfo": paymentInfo }
  else:
      # Updating.
      response_old = TABLES.responses.get_item(Key={ 'formId': formId, 'responseId': responseId })["Item"]
      response_new = TABLES.responses.update_item(
          Key={ 'formId': formId, 'responseId': responseId },
          UpdateExpression=("SET"
              " UPDATE_HISTORY = list_append(if_not_exists(UPDATE_HISTORY, :empty_list), :updateHistory),"
              " PENDING_UPDATE = :pendingUpdate,"
              " date_last_modified = :now"),
          ExpressionAttributeValues={
              ':updateHistory': [{
                  "date": datetime.datetime.now().isoformat(),
                  "action": "pending_update"
              }],
              ":pendingUpdate": {
                  "value": response_data,
                  "modifyLink": modifyLink,
                  "paymentInfo": paymentInfo
              },
              ':empty_list': [],
              ":now": datetime.datetime.now().isoformat()
          },
          # todo: if not updated, do this ...
          ReturnValues="ALL_NEW"
      )["Attributes"]
      paid = False
      if paymentInfo["total"] == 0 or (response_old.get("PAID", None) == True and paymentInfo["total"] <= response_old["paymentInfo"]["total"]):
          # If 1) total amount is zero (user uses coupon code to get for free); or 2) user is updating a name or something -- so that they don't owe any more money -- update immediately.
          response_verify_update(response_new, TABLES.responses, confirmationEmailInfo)
          paid = True
      return {
          "success": True,
          "paid": paid,
          "action": "update",
          "id": responseId,
          "paymentInfo": paymentInfo,
          "total_amt_received": response_old.get("IPN_TOTAL_AMOUNT", 0), # todo: encode currency into here as well.
          "paymentInfo_old": response_old["paymentInfo"]
      }