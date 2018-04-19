import sys
import urllib.parse
import requests
import datetime
from .emailer import send_confirmation_email
from .responseHandler import response_verify_update
import json
from json2html import json2html
from .dbConnection import DBConnection
from decimal import Decimal
from botocore.exceptions import ClientError

"""
action=ipn&cmd=_notify-validate&mc_gross=19.95&protection_eligibility=Eligible&address_status=confirmed&payer_id=LPLWNMTBWMFAY&tax=0.00&address_street=1+Main+St&payment_date=20%3A12%3A59+Jan+13%2C+2009+PST&payment_status=Completed&charset=windows-1252&address_zip=95131&first_name=Test&mc_fee=0.88&address_country_code=US&address_name=Test+User&notify_version=2.6&custom=&payer_status=verified&address_country=United+States&address_city=San+Jose&quantity=1&verify_sign=AtkOfCXbDm2hu0ZELryHFjY-Vb7PAUvS6nMXgysbElEn9v-1XcmSoGtf&payer_email=gpmac_1231902590_per%40paypal.com&txn_id=61E67681CH3238416&payment_type=instant&last_name=User&address_state=CA&receiver_email=gpmac_1231902686_biz%40paypal.com&payment_fee=0.88&receiver_id=S8XGHLYDW9T3S&txn_type=express_checkout&item_name=&mc_currency=USD&item_number=&residence_country=US&test_ipn=1&handling_amount=0.00&transaction_subject=&payment_gross=19.95&shipping=0.00

Full list of IPN variables: https://developer.paypal.com/docs/classic/ipn/integration-guide/IPNandPDTVariables/

{
        "mc_gross": "25.00",
        "protection_eligibility": "Eligible",
        "address_status": "confirmed",
        "payer_id": "A4CSL993V3BDG",
        "address_street": "1 Main St",
        "payment_date": "11:27:19 Jan 07, 2018 PST",
        "payment_status": "Completed",
        "charset": "windows-1252",
        "address_zip": "95131",
        "first_name": "test",
        "mc_fee": "1.03",
        "address_country_code": "US",
        "address_name": "test buyer",
        "notify_version": "3.8",
        "custom": "5a527474bdc24800015b8034",
        "payer_status": "verified",
        "business": "aramaswamis-facilitator@gmail.com",
        "address_country": "United States",
        "address_city": "San Jose",
        "quantity": "1",
        "verify_sign": "AnJ2HUJsm40z244.ABNEwFR12hcFAGNgnedQIC2BPo3UV35k2cCQrzGk",
        "payer_email": "aramaswamis-buyer@gmail.com",
        "txn_id": "3H3308841Y0633836",
        "payment_type": "instant",
        "last_name": "buyer",
        "address_state": "CA",
        "receiver_email": "aramaswamis-facilitator@gmail.com",
        "payment_fee": "1.03",
        "receiver_id": "T4A6C58SP7PP2",
        "txn_type": "express_checkout",
        "mc_currency": "USD",
        "residence_country": "US",
        "test_ipn": "1",
        "payment_gross": "25.00",
        "ipn_track_id": "562abbbb392ab",
        "cmd": "_notify-validate"
    }
"""

sandboxOptions = {
    "DEV": True,
    "BETA": True,
    "PROD": False
}


class IpnHandler(DBConnection):
    def ipnHandler(self, param_str):
        sandbox = sandboxOptions[self.alias]
        VERIFY_URL_PROD = 'https://www.paypal.com/cgi-bin/webscr'
        VERIFY_URL_TEST = 'https://www.sandbox.paypal.com/cgi-bin/webscr'

        # Switch as appropriate
        VERIFY_URL = VERIFY_URL_TEST if sandbox else VERIFY_URL_PROD

        # Read and parse query string
        # param_str = sys.stdin.readline().strip()

        params = urllib.parse.parse_qsl(param_str)

        # verify payment. should be equal to amount owed.

        # Add '_notify-validate' parameter
        params.append(('cmd', '_notify-validate'))

        # Post back to PayPal for validation
        headers = {'content-type': 'application/x-www-form-urlencoded',
                   'host': 'www.paypal.com'}
        r = requests.post(VERIFY_URL, params=params,
                          headers=headers, verify=True)
        r.raise_for_status()

        # Check return message and take action as needed
        self.paramDict = dict(params)
        formId, responseId = self.paramDict["custom"].split("/", 1)
        self.responseKey = {
            'formId': formId,
            'responseId': responseId
        }

        if r.text == 'VERIFIED':
            # payment_status completed.
            self.get_schema_modifier_items()
            expected_receiver_email = self.get_expected_receiver_email_paypal_classic()
            if self.paramDict["receiver_email"] != expected_receiver_email:
                msg = "Emails do not match; receiver email is {} and expected email is {}.".format(self.paramDict["receiver_email"], expected_receiver_email)
                self.append_ipn_with_status("INVALID", msg)
                return msg
            if self.paramDict["payment_status"] != "Completed":
                self.append_ipn_with_status("INVALID", "Payment status is not complete.")
            try:
                response = self.responses.update_item(
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
                return "Invalid; duplicate IPN TXN ID"
            
            #if self.paramDict["payment_status"] == "Completed":
            
            # Has user paid the amount owed? Checks the PENDING_UPDATE for the total amount owed, else the response itself (when not updating).
            fullyPaid = response["IPN_TOTAL_AMOUNT"] >= response.get("PENDING_UPDATE", response)["paymentInfo"]["total"]

            if fullyPaid and "PENDING_UPDATE" in response:
                # Updates value from saved pending update value and sends email.
                response_verify_update(response, self.responses, self.confirmationEmailInfo)
            else:
                # update it as paid or not.
                response = self.responses.update_item(
                    Key=self.responseKey,
                    UpdateExpression=("SET PAID = :paid"),
                    ExpressionAttributeValues={
                        ":paid": fullyPaid
                    },
                    ReturnValues="ALL_NEW"
                )["Attributes"]
                send_confirmation_email(response, self.confirmationEmailInfo)

            return params
        elif r.text == 'INVALID':
            self.append_ipn_with_status("INVALID", "Rejected by PayPal: {}".format(VERIFY_URL))
            raise Exception("Invalid IPN")
            return "invalid"
        else:
            raise Exception("IPN was neither VERIFIED nor INVALID.")
            return "else"
        return params

    def append_ipn_with_status(self, status="INVALID", description=""):
        response = self.responses.update_item(
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
        formKey = self.responses.get_item(
            Key=self.responseKey,
            ProjectionExpression="form"
        )["Item"]["form"]
        formKey['version'] = int(formKey['version'])
        schemaModifierKey = self.forms.get_item(
            Key=formKey,
            ProjectionExpression="schemaModifier"
        )["Item"]["schemaModifier"]
        schemaModifierKey['version'] = int(schemaModifierKey['version'])
        schemaModifier = self.schemaModifiers.get_item(
            Key=schemaModifierKey,
            ProjectionExpression="confirmationEmailInfo, paymentMethods"
        )["Item"]
        self.confirmationEmailInfo = schemaModifier["confirmationEmailInfo"]
        self.paymentMethods = schemaModifier["paymentMethods"]
    def get_expected_receiver_email_paypal_classic(self):
        return self.paymentMethods["paypal_classic"]["business"]