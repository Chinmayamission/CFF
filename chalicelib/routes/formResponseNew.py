import uuid
from decimal import Decimal
import datetime
from pydash.objects import pick, get, unset
from ..util.formSubmit.util import calculate_price
from ..util.formSubmit.couponCodes import coupon_code_verify_max_and_record_as_used
from ..util.formSubmit.emailer import send_confirmation_email
from ..util.formSubmit.responseHandler import response_verify_update
from ..util.formSubmit.ccavenue import update_ccavenue_hash
from ..util.formSubmit.paymentMethods import fill_paymentMethods_with_data
from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId


def form_response_new(formId, responseId=None):
  from ..main import app
  newResponse = False
  email_sent = False
  if not responseId:
      responseId = ObjectId()
      newResponse = True
  else:
      responseId = ObjectId(responseId)
  
  response_data = app.current_request.json_body["data"]
  modifyLink = app.current_request.json_body['modifyLink']
  form = Form.objects.get({"_id":ObjectId(formId)}).only("name", "schema", "uiSchema", "formOptions", "cff_permissions") #couponCodes
  formOptions = form.formOptions
  paymentInfo = formOptions.setdefault('paymentInfo', {})
  confirmationEmailInfo = formOptions.setdefault('confirmationEmailInfo', {})
  paymentMethods = fill_paymentMethods_with_data(formOptions.setdefault('paymentMethods', {}), response_data)

  def calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo):
    paymentInfoItem['amount'] = Decimal(calculate_price(paymentInfoItem.get('amount', '0'), response_data))
    paymentInfoItem['quantity'] = Decimal(calculate_price(paymentInfoItem.get('quantity', '0'), response_data))
    paymentInfo['total'] += paymentInfoItem['amount'] * paymentInfoItem['quantity']
  paymentInfoItemsWithTotal = []
  paymentInfo['total'] = 0
  for paymentInfoItem in paymentInfo.setdefault('items', []):
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
          return {"res": {"success": False, "message": "Coupon Code not found.", "fields_to_clear": ["couponCode"]}}
      # verify max # of coupons:
      code_valid, code_num_remaining = coupon_code_verify_max_and_record_as_used(TABLES.forms, form, couponCode, responseId, response_data)
      if not code_valid:
          message = "Coupon code maximum reached.\nSubmitting this form will cause you to exceed the coupon code maximum.\nNumber of spots remaining: {}".format(code_num_remaining)
          return {"res": {"success": False, "message": message, "fields_to_clear": ["couponCode"]}}
  else:
      response_data.pop("couponCode", None)
  response_data.pop("total", None)

  paymentInfo['items'] = [item for item in paymentInfo['items'] if item['quantity'] * item['amount'] != 0]
  if newResponse:
      paid = paymentInfo["total"] == 0
      response = Response(
          form=Form,
          id=responseId,
          #modifyLink=modifyLink,
          value=response_data,
          date_last_modified=datetime.datetime.now().isoformat(),
          date_created=datetime.datetime.now().isoformat(),
          paymentInfo=paymentInfo,
          PAID=paid
      ).save()
      response = serialize_model(response)
      if paid and confirmationEmailInfo: # If total amount is zero (user uses coupon code to get for free)
          send_confirmation_email(response, confirmationEmailInfo)
          email_sent = True
      if "ccavenue" in paymentMethods: # todo: add this in update too.
          paymentMethods["ccavenue"] = update_ccavenue_hash(formId, paymentMethods["ccavenue"], form["center"], response)
      if "auto_email" in paymentMethods and get(paymentMethods, "auto_email.enabled", True) == True and type(get(paymentMethods, "autoEmail.confirmationEmailInfo") is dict):
          send_confirmation_email(response, get(paymentMethods, "auto_email.confirmationEmailInfo"))
          email_sent = True
      return {"res": {"paid": paid, "success": True, "action": "insert", "email_sent": email_sent, "id": responseId, "paymentInfo": paymentInfo, "paymentMethods": paymentMethods } }
  else:
      raise Exception("Updating is not supported yet!")
      """# Updating.
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
          "res": {
            "success": True,
            "paid": paid,
            "action": "update",
            # "email_sent": email_sent,
            "id": responseId,
            "paymentInfo": paymentInfo,
            "paymentMethods": paymentMethods,
            "total_amt_received": response_old.get("IPN_TOTAL_AMOUNT", 0), # todo: encode currency into here as well.
            "paymentInfo_old": response_old["paymentInfo"]
          }
      }
      """