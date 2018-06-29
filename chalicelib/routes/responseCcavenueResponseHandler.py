from botocore.exceptions import ClientError
import json
from urllib.parse import parse_qsl
from chalicelib.util.ccavutil import decrypt
from chalicelib.util.formSubmit.emailer import send_confirmation_email
import chalice
import datetime
from decimal import Decimal
from pydash.objects import get
from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId

"""
 {'order_id': '4qwjQy46tSDjYEvmdDPi4m', 'tracking_id': '307003756646', 'bank_ref_no': '1525281619352', 'order_status': 'Success', 'payment_mode': 'Net Banking', 'card_name': 'AvenuesTest', 'status_code': 'null', 'status_message': 'Y', 'currency': 'INR', 'amount': '50.0', 'billing_name': 'Ashwin Ramaswami', 'billing_address': '123 123 Lane', 'billing_city': 'Buckhead', 'billing_state': 'GA', 'billing_zip': '12302', 'billing_country': 'USA', 'billing_tel': '7705159732', 'billing_email': 'aramaswamis@gmail.com', 'merchant_param1': '031ee09a-6b40-4f5f-af66-71f71115d088', 'vault': 'N', 'offer_type': 'null', 'offer_code': 'null', 'discount_value': '0.0', 'mer_amount': '50.0', 'eci_value': 'null', 'retry': 'N', 'response_code': '0', 'trans_date': '02/05/2018 22:51:06'}
"""
def append_ipn_fail_with_status(formId, responseId, paramDict, status="INVALID", description=" "):
  from ..main import TABLES
  # response = Response
  #response = Response.objects.get({"_id":ObjectId(responseId)})
  #form = Form.objects.only("formOptions").get({"_id":response.form.id})
  response = TABLES.responses.update_item(
      Key=dict(formId=formId, responseId=responseId),
      UpdateExpression=("set IPN_HISTORY = list_append(if_not_exists(IPN_HISTORY, :empty_list), :ipnValue),"
                        " IPN_STATUS = :status"),
      ExpressionAttributeValues={
          ':ipnValue': [{
              "method": "ccavenue",
              "date": datetime.datetime.now().isoformat(),
              "value": paramDict,
              "status": status,
              "description": description
          }],
          ':empty_list': [],
          ':status': "INVALID"
      }
  )

def append_ipn_success(formId, responseId, paramDict, schemaModifier):
  from ..main import TABLES, PROD
  try:
    response = TABLES.responses.update_item(
      Key=dict(formId=formId, responseId=responseId),
      UpdateExpression=("ADD IPN_TOTAL_AMOUNT :amt"
                          " SET CCAVENUE_TXN_IDS = list_append(if_not_exists(CCAVENUE_TXN_IDS, :empty_list), :txn_id_list),"
                          " IPN_HISTORY = list_append(if_not_exists(IPN_HISTORY, :empty_list), :ipnValue),"
                          " PAYMENT_HISTORY = list_append(if_not_exists(PAYMENT_HISTORY, :empty_list), :paymentHistoryValue),"
                          " PAID = :paid"),
      ExpressionAttributeValues={
          ':amt': Decimal(paramDict["amount"]),
          ':paymentHistoryValue': [{
              "amount": Decimal(paramDict["amount"]),
              "currency": paramDict["currency"],
              "date": datetime.datetime.now().isoformat(),
              "method": "ccavenue"
          }],
          ':ipnValue': [{
              "date": datetime.datetime.now().isoformat(),
              "sandbox": not PROD,
              "value": paramDict,
              "status": paramDict["order_status"]
          }],
          ':empty_list': [],
          ":paid": False,
          ":txn_id": paramDict["order_id"],
          ":txn_id_list": [paramDict["order_id"]]
      },
      ReturnValues="ALL_NEW",
      ConditionExpression="not contains(PAYPAL_TXN_IDS, :txn_id)"
    )["Attributes"]
  except ClientError as e:
    if e.response['Error']['Code'] != 'ConditionalCheckFailedException':
        raise
    append_ipn_fail_with_status(formId, responseId, paramDict, status=paramDict["order_status"], description="Duplicate IPN TXN ID")
    raise Exception("Invalid; duplicate IPN TXN ID")

  # todo: Refactor the following code:
  # Has user paid the amount owed? Checks the PENDING_UPDATE for the total amount owed, else the response itself (when not updating).
  fullyPaid = response["IPN_TOTAL_AMOUNT"] >= response.get("PENDING_UPDATE", response)["paymentInfo"]["total"]

  if fullyPaid and "PENDING_UPDATE" in response:
      # Updates value from saved pending update value and sends email.
      pass # todo: we don't support updates as of now.
      # response_verify_update(response, self.TABLES.responses, self.confirmationEmailInfo)
  else:
    # update it as paid or not.
    response = TABLES.responses.update_item(
        Key=dict(responseId=responseId, formId=formId),
        UpdateExpression=("SET PAID = :paid"),
        ExpressionAttributeValues={
            ":paid": fullyPaid
        },
        ReturnValues="ALL_NEW"
    )["Attributes"]
    send_confirmation_email(response, schemaModifier["confirmationEmailInfo"])


def response_ccavenue_response_handler(formId, responseId):
  from ..main import app, TABLES
  form = TABLES.forms.get_item(
    Key=dict(id=formId, version=1),
    ProjectionExpression="center, schemaModifier"
  )["Item"]
  schemaModifier = TABLES.schemaModifiers.get_item(
      Key=form["schemaModifier"],
      ProjectionExpression="confirmationEmailInfo, paymentMethods, paymentInfo"
    )["Item"]
  centerId = form["center"]
  center = TABLES.centers.get_item(
    Key=dict(id=centerId),
    ProjectionExpression="paymentInfo"
  )["Item"]
  # access_code = center["paymentInfo"]["ccavenue"]["access_code"]
  # merchant_id = center["paymentInfo"]["ccavenue"]["merchant_id"]
  SECRET_working_key = center["paymentInfo"]["ccavenue"]["working_key"]
  
  res = dict(parse_qsl(app.current_request.raw_body.decode('utf-8')))
  paramDict = decrypt(res['encResp'], SECRET_working_key)
  if paramDict["merchant_param1"] != formId or paramDict["merchant_param2"] != responseId:
    raise Exception(f"Form id / response id do not match. \nExpected: {formId}/{responseId}. \nReceived: {paramDict['merchant_param1']}/{paramDict['merchant_param1']}")
  if paramDict["order_status"] != "Success":
    append_ipn_fail_with_status(formId, responseId, paramDict, status=paramDict["order_status"])
    return "ERROR: \n {}".format(paramDict)
    # todo: redirect to another error page.
  elif paramDict["order_status"] == "Success":
    append_ipn_success(formId, responseId, paramDict, schemaModifier)
    redirect_url = get(schemaModifier, "paymentMethods.ccavenue.redirectUrl", get(schemaModifier, "paymentInfo.redirectUrl", ""))
    return chalice.Response('', status_code=302,
      headers={'Location': redirect_url })