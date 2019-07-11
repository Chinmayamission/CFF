import datetime
import requests
import urllib
from decimal import Decimal
from botocore.exceptions import ClientError
from ..util.formSubmit.emailer import send_confirmation_email
from chalicelib.models import PaymentTrailItem, UpdateTrailItem, PaymentStatusDetailItem, EmailTrailItem, Form, Response
from bson.objectid import ObjectId
from bson.decimal128 import Decimal128
from decimal import Decimal

# Paypal IPN variables: https://developer.paypal.com/docs/classic/ipn/integration-guide/IPNandPDTVariables/#transaction-and-notification-related-variables

def update_response_paid_status(response):
    """
    Update response paid status and apply updates, as necessary.
    """
    response.paid = float(response.amount_paid) >= float(response.paymentInfo.get("total", 0))
    if response.pending_update:
        response.paid = float(response.amount_paid) >= float(response.pending_update["paymentInfo"].get("total", 0))
        if response.paid:
            response.value = response.pending_update["value"]
            response.paymentInfo = response.pending_update["paymentInfo"]
            response.pending_update = None
            response.update_trail.append(UpdateTrailItem(date=datetime.datetime.now(), update_type="apply_update"))
    return response.paid

def mark_successful_payment(form, response, full_value, method_name, amount, currency, id, date=None):
    if not date:
        date = datetime.datetime.now()
    response.payment_trail.append(PaymentTrailItem(value=full_value, status="SUCCESS", date=date, date_created=date, date_modified=date, method=method_name, id=id))
    response.payment_status_detail.append(PaymentStatusDetailItem(amount=str(amount), currency=currency, date=date, date_created=date, date_modified=date, method=method_name, id=id))
    response.amount_paid = str(float(response.amount_paid or 0) + float(amount))
    update_response_paid_status(response)
    if form.formOptions.confirmationEmailInfo:
        email_sent = send_confirmation_email(response, form.formOptions.confirmationEmailInfo)
    return response.paid

def mark_error_payment(response, message, method_name, full_value):
    response.payment_trail.append(PaymentTrailItem(value=full_value, status="ERROR", date=datetime.datetime.now(), date_created=date, date_modified=date, method=method_name, id=message))
    response.save()
    raise Exception("IPN ERROR: " + message)

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
    responseIdFromIpn = paramDict.get("custom", "")
    response = Response.objects.get({"_id": ObjectId(responseId)})
    
    def raise_ipn_error(message):
        response.payment_trail.append(PaymentTrailItem(value=paramDict, status="ERROR", date=datetime.datetime.now(), method="paypal_ipn", id=message))
        response.save()
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
    if r.text == 'VERIFIED':
        # payment_status completed.
        form = Form.objects.only("formOptions").get({"_id":response.form.id})
        expected_receiver_email = form.formOptions.paymentMethods["paypal_classic"]["business"]
        if paramDict.get('txn_type', '') == "subscr_signup":
            # Don't handle subscription signups.
            return
        if paramDict["receiver_email"] != expected_receiver_email:
            raise_ipn_error("Emails do not match.".format(paramDict["receiver_email"], expected_receiver_email))
        txn_id = paramDict["txn_id"]
        if any(item.status == "SUCCESS" and item.id == txn_id and item.method == "paypal_ipn" for item in response.payment_trail):
            raise_ipn_error(f"Duplicate IPN transaction ID: {txn_id}")
        # TODO: add check for mc_currency
        if paramDict["payment_status"] == "Completed":
            mark_successful_payment(
                form=form,
                response=response,
                full_value=paramDict,
                method_name="paypal_ipn",
                amount=paramDict["mc_gross"],
                currency=paramDict["mc_currency"],
                id=txn_id
            )
            response.save()
        elif paramDict["payment_status"] == "Refunded":
            mark_successful_payment(
                form=form,
                response=response,
                full_value=paramDict,
                method_name="paypal_ipn",
                amount=paramDict["mc_gross"],
                currency=paramDict["mc_currency"],
                id=txn_id
            )
            response.save()
        else:
            raise_ipn_error("Payment_status is not supported. Only Completed and Refunded payment statuses are supported.")
        # Has user paid the amount owed? Checks the PENDING_UPDATE for the total amount owed, else the response itself (when not updating).
        # fullyPaid = response["IPN_TOTAL_AMOUNT"] >= response.get("PENDING_UPDATE", response)["paymentInfo"]["total"]

        # if fullyPaid and "PENDING_UPDATE" in response:
        #     # Updates value from saved pending update value and sends email.
        #     response_verify_update(response, self.TABLES.responses, form.formOptions.confirmationEmailInfo)
        # else:
        #     # update it as paid or not.
    elif r.text == 'INVALID':
        raise_ipn_error("Rejected by PayPal: {}".format(VERIFY_URL))
    else:
        raise_ipn_error("IPN was neither VERIFIED nor INVALID.")

    return ""
