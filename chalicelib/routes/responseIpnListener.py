import datetime
import requests
import urllib
from decimal import Decimal
from botocore.exceptions import ClientError
from ..util.formSubmit.emailer import send_confirmation_email
from ..util.formSubmit.responseHandler import response_verify_update
from chalicelib.models import PaymentTrailItem, PaymentStatusDetailItem, Form, Response
from bson.objectid import ObjectId

def response_ipn_listener(responseId):
    from ..main import app, PROD

    ipn_body = app.current_request.raw_body.decode('utf-8')
    VERIFY_URL_PROD = 'https://www.paypal.com/cgi-bin/webscr'
    VERIFY_URL_TEST = 'https://www.sandbox.paypal.com/cgi-bin/webscr'
    sandbox = not PROD
    VERIFY_URL = VERIFY_URL_PROD if PROD else VERIFY_URL_TEST
    params = urllib.parse.parse_qsl(ipn_body)

    # verify payment. should be equal to amount owed.
    paramDict = dict(params)
    responseIdFromIpn = paramDict["custom"]
    response = Response.objects.get({"_id": ObjectId(responseId)})
    
    def raise_ipn_error(message):
        response.payment_trail.append(PaymentTrailItem(value=paramDict, status="ERROR", date=datetime.datetime.now(), method="paypal_ipn", id=message))
        raise Exception("IPN ERROR: " + message)

    if responseId != responseIdFromIpn:
        raise_ipn_error("Response ID {} does not match this endpoint: {}".format(responseIdFromIpn, responseId))
    
    # Add '_notify-validate' parameter
    params.append(('cmd', '_notify-validate'))

    # Post back to PayPal for validation
    headers = {'content-type': 'application/x-www-form-urlencoded',
                'host': 'www.paypal.com'}
    r = requests.post(VERIFY_URL, params=params,
                        headers=headers, verify=True)
    r.raise_for_status()

    # Check return message and take action as needed
    if True or r.text == 'VERIFIED':
        # payment_status completed.
        form = Form.objects.only("formOptions").get({"_id":response.form.id})
        expected_receiver_email = form.formOptions.paymentMethods["paypal_classic"]["business"]
        if paramDict["receiver_email"] != expected_receiver_email:
            raise_ipn_error("Emails do not match; receiver email is {} and expected email is {}.".format(paramDict["receiver_email"], expected_receiver_email))
        if paramDict["payment_status"] != "Completed":
            raise_ipn_error("Payment status is not complete.")
        
        txn_id = paramDict["txn_id"]
        if any(item.status == "SUCCESS" and item.id == txn_id for item in response.payment_trail):
            raise_ipn_error(f"Duplicate IPN transaction ID: {txn_id}")
        
        response.payment_trail.append(PaymentTrailItem(value=paramDict, status="SUCCESS", date=datetime.datetime.now(), method="paypal_ipn", id=txn_id))
        response.payment_status_detail.append(PaymentStatusDetailItem(amount=paramDict["mc_gross"], currency=paramDict["mc_currency"], data=datetime.datetime.now().isoformat(), method="paypal_ipn"))
        response.amount_paid += self.paramDict["mc_gross"]
        # Has user paid the amount owed? Checks the PENDING_UPDATE for the total amount owed, else the response itself (when not updating).
        # fullyPaid = response["IPN_TOTAL_AMOUNT"] >= response.get("PENDING_UPDATE", response)["paymentInfo"]["total"]

        # if fullyPaid and "PENDING_UPDATE" in response:
        #     # Updates value from saved pending update value and sends email.
        #     response_verify_update(response, self.TABLES.responses, form.formOptions.confirmationEmailInfo)
        # else:
        #     # update it as paid or not.
        #     response = self.TABLES.responses.update_item(
        #         Key=self.responseKey,
        #         UpdateExpression=("SET PAID = :paid"),
        #         ExpressionAttributeValues={
        #             ":paid": fullyPaid
        #         },
        #         ReturnValues="ALL_NEW"
        #     )["Attributes"]
        #     send_confirmation_email(response, form.formOptions.confirmationEmailInfo)
    elif r.text == 'INVALID':
        raise_ipn_error("Rejected by PayPal: {}".format(VERIFY_URL))
    else:
        raise_ipn_error("IPN was neither VERIFIED nor INVALID.")

    return ""


