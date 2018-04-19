import datetime
import requests
import urllib
from decimal import Decimal
from botocore.exceptions import ClientError
from ..util.formSubmit.emailer import send_confirmation_email
from ..util.formSubmit.responseHandler import response_verify_update

class IpnHandler:
  def __init__(self, responseId, ipn_body):
      from ..main import TABLES, PROD
      self.TABLES = TABLES
      VERIFY_URL_PROD = 'https://www.paypal.com/cgi-bin/webscr'
      VERIFY_URL_TEST = 'https://www.sandbox.paypal.com/cgi-bin/webscr'
      sandbox = not PROD
      VERIFY_URL = VERIFY_URL_PROD if PROD else VERIFY_URL_TEST

      # Read and parse query string
      # param_str = sys.stdin.readline().strip()

      params = urllib.parse.parse_qsl(ipn_body)

      # verify payment. should be equal to amount owed.
      self.paramDict = dict(params)
      formId, responseIdFromIpn = self.paramDict["custom"].split("/", 1)
      self.responseKey = {
          'formId': formId,
          'responseId': responseIdFromIpn
      }
      if responseId != responseIdFromIpn:
          raise Exception("Response ID {} does not match this endpoint: {}".format(responseIdFromIpn, responseId))


      # Add '_notify-validate' parameter
      params.append(('cmd', '_notify-validate'))

      # Post back to PayPal for validation
      headers = {'content-type': 'application/x-www-form-urlencoded',
                  'host': 'www.paypal.com'}
      r = requests.post(VERIFY_URL, params=params,
                          headers=headers, verify=True)
      r.raise_for_status()

      # Check return message and take action as needed
      if r.text == 'VERIFIED':
          # payment_status completed.
          self.get_schema_modifier_items()
          expected_receiver_email = self.get_expected_receiver_email_paypal_classic()
          if self.paramDict["receiver_email"] != expected_receiver_email:
              msg = "Emails do not match; receiver email is {} and expected email is {}.".format(self.paramDict["receiver_email"], expected_receiver_email)
              self.append_ipn_with_status("INVALID", msg)
              raise Exception(msg)
          if self.paramDict["payment_status"] != "Completed":
              msg = "Payment status is not complete."
              self.append_ipn_with_status("INVALID", msg)
              raise Exception(msg)
          try:
              response = self.TABLES.responses.update_item(
                  Key=self.responseKey,
                  UpdateExpression=("ADD IPN_TOTAL_AMOUNT :amt"
                                      " SET PAYPAL_TXN_IDS = list_append(if_not_exists(PAYPAL_TXN_IDS, :empty_list), :txn_id_list),"
                                      " IPN_HISTORY = list_append(if_not_exists(IPN_HISTORY, :empty_list), :ipnValue),"
                                      " PAYMENT_HISTORY = list_append(if_not_exists(PAYMENT_HISTORY, :empty_list), :paymentHistoryValue),"
                                      " PAID = :paid"),
                  ExpressionAttributeValues={
                      ':amt': Decimal(self.paramDict["mc_gross"]),
                      ':ipnValue': [{
                          "date": datetime.datetime.now().isoformat(),
                          "sandbox": sandbox,
                          "value": self.paramDict,
                          "status": "VERIFIED"
                      }],
                      ':paymentHistoryValue': [{
                          "amount": Decimal(self.paramDict["mc_gross"]),
                          "currency": self.paramDict["mc_currency"],
                          "date": datetime.datetime.now().isoformat(),
                          "method": "paypal"
                      }],
                      ':empty_list': [],
                      ":paid": False,
                      ":txn_id": self.paramDict["txn_id"],
                      ":txn_id_list": [self.paramDict["txn_id"]]
                  },
                  ReturnValues="ALL_NEW",
                  ConditionExpression="not contains(PAYPAL_TXN_IDS, :txn_id)"
              )["Attributes"]
          except ClientError as e:
              # Ignore the ConditionalCheckFailedException, bubble up
              # other exceptions.
              if e.response['Error']['Code'] != 'ConditionalCheckFailedException':
                  raise
              self.append_ipn_with_status("INVALID", "Duplicate IPN TXN ID")
              raise Exception("Invalid; duplicate IPN TXN ID")
          
          #if self.paramDict["payment_status"] == "Completed":
          
          # Has user paid the amount owed? Checks the PENDING_UPDATE for the total amount owed, else the response itself (when not updating).
          fullyPaid = response["IPN_TOTAL_AMOUNT"] >= response.get("PENDING_UPDATE", response)["paymentInfo"]["total"]

          if fullyPaid and "PENDING_UPDATE" in response:
              # Updates value from saved pending update value and sends email.
              response_verify_update(response, self.TABLES.responses, self.confirmationEmailInfo)
          else:
              # update it as paid or not.
              response = self.TABLES.responses.update_item(
                  Key=self.responseKey,
                  UpdateExpression=("SET PAID = :paid"),
                  ExpressionAttributeValues={
                      ":paid": fullyPaid
                  },
                  ReturnValues="ALL_NEW"
              )["Attributes"]
              send_confirmation_email(response, self.confirmationEmailInfo)

          return
      elif r.text == 'INVALID':
          self.append_ipn_with_status("INVALID", "Rejected by PayPal: {}".format(VERIFY_URL))
          raise Exception("Invalid IPN")
      else:
          raise Exception("IPN was neither VERIFIED nor INVALID.")

  def append_ipn_with_status(self, status="INVALID", description=""):
      response = self.TABLES.responses.update_item(
          Key=self.responseKey,
          UpdateExpression=("set IPN_HISTORY = list_append(if_not_exists(IPN_HISTORY, :empty_list), :ipnValue),"
                              " IPN_STATUS = :status"),
          ExpressionAttributeValues={
              ':ipnValue': [{
                  "date": datetime.datetime.now().isoformat(),
                  "value": self.paramDict,
                  "status": status,
                  "description": description
              }],
              ':empty_list': [],
              ':status': "INVALID"
          }
      )
  def get_schema_modifier_items(self):
      formKey = self.TABLES.responses.get_item(
          Key=self.responseKey,
          ProjectionExpression="form"
      )["Item"]["form"]
      formKey['version'] = int(formKey['version'])
      schemaModifierKey = self.TABLES.forms.get_item(
          Key=formKey,
          ProjectionExpression="schemaModifier"
      )["Item"]["schemaModifier"]
      schemaModifierKey['version'] = int(schemaModifierKey['version'])
      schemaModifier = self.TABLES.schemaModifiers.get_item(
          Key=schemaModifierKey,
          ProjectionExpression="confirmationEmailInfo, paymentMethods"
      )["Item"]
      self.confirmationEmailInfo = schemaModifier["confirmationEmailInfo"]
      self.paymentMethods = schemaModifier["paymentMethods"]
  def get_expected_receiver_email_paypal_classic(self):
      return self.paymentMethods["paypal_classic"]["business"]


def response_ipn_listener(responseId):
    from ..main import app
    IpnHandler(responseId, app.current_request.raw_body.decode('utf-8'))
    return ""