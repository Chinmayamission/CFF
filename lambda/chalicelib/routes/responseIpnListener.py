import datetime
import requests
import urllib
from decimal import Decimal
from botocore.exceptions import ClientError
from ..util.formSubmit.emailer import send_confirmation_email
from chalicelib.models import (
    PaymentTrailItem,
    UpdateTrailItem,
    PaymentStatusDetailItem,
    EmailTrailItem,
    Form,
    Response,
)
from bson.objectid import ObjectId
from bson.decimal128 import Decimal128
from decimal import Decimal
from pydash.collections import find

# Paypal IPN variables: https://developer.paypal.com/docs/classic/ipn/integration-guide/IPNandPDTVariables/#transaction-and-notification-related-variables


def update_response_paid_status(response):
    """
    Update response paid status and apply updates, as necessary.
    """
    response.paid = float(response.amount_paid) >= float(
        response.paymentInfo.get("total", 0)
    )
    if response.pending_update:
        response.paid = float(response.amount_paid) >= float(
            response.pending_update["paymentInfo"].get("total", 0)
        )
        if response.paid:
            response.value = response.pending_update["value"]
            response.paymentInfo = response.pending_update["paymentInfo"]
            response.pending_update = None
            response.update_trail.append(
                UpdateTrailItem(
                    date=datetime.datetime.now(), update_type="apply_update"
                )
            )
    return response.paid


def mark_successful_payment(
    form,
    response,
    full_value,
    method_name,
    amount,
    currency,
    id,
    date=None,
    send_email=True,
    notes=None,
    email_template_id=None
):
    if not date:
        date = datetime.datetime.now()
    payment_trail_kwargs = dict(
        value=full_value,
        status="SUCCESS",
        date=date,
        date_created=date,
        date_modified=date,
        method=method_name,
        id=id,
    )
    payment_status_detail_kwargs = dict(
        amount=str(amount),
        currency=currency,
        date=date,
        date_created=date,
        date_modified=date,
        method=method_name,
        id=id,
    )
    if notes is not None:
        payment_trail_kwargs = dict(payment_trail_kwargs, notes=notes)
        payment_status_detail_kwargs = dict(payment_status_detail_kwargs, notes=notes)
    response.payment_trail.append(PaymentTrailItem(**payment_trail_kwargs))
    response.payment_status_detail.append(
        PaymentStatusDetailItem(**payment_status_detail_kwargs)
    )

    response.amount_paid = str(float(response.amount_paid or 0) + float(amount))
    update_response_paid_status(response)
    if send_email:
        send_email_receipt(response, form.formOptions, email_template_id)
    return response.paid

def send_email_receipt(response, formOptions, email_template_id=None):
    # Use the confirmationEmailInfo corresponding to email_template_id, falling back to formOptions.confirmationEmailInfo if none specified / found
    confirmationEmailInfo = None
    if email_template_id and formOptions.confirmationEmailTemplates:
        matchingConfirmationEmailTemplate = find(formOptions.confirmationEmailTemplates, lambda x: x.get("id") == email_template_id)
        if matchingConfirmationEmailTemplate:
            confirmationEmailInfo = matchingConfirmationEmailTemplate.get("confirmationEmailInfo")
    if not confirmationEmailInfo:
        confirmationEmailInfo = formOptions.confirmationEmailInfo
    if confirmationEmailInfo:
        email_sent = send_confirmation_email(
            response, confirmationEmailInfo
        )


def mark_error_payment(response, message, method_name, full_value):
    response.payment_trail.append(
        PaymentTrailItem(
            value=full_value,
            status="ERROR",
            date=datetime.datetime.now(),
            date_created=date,
            date_modified=date,
            method=method_name,
            id=message,
        )
    )
    response.save()
    raise Exception("IPN ERROR: " + message)


def parse_ipn_body(ipn_body):
    """Parses a paypal IPN body, using the appropriate charset encoded in it.
    """
    DEFAULT_CHARSET = "windows-1252" # Default charset for paypal IPN response
    params = urllib.parse.parse_qsl(ipn_body, encoding=DEFAULT_CHARSET)
    paramDict = dict(params)
    # Handle other encodings (utf-8) if it is configured in paypal.
    if paramDict.get("charset", DEFAULT_CHARSET) != DEFAULT_CHARSET:
        params = urllib.parse.parse_qsl(ipn_body, encoding=paramDict.get("charset"))
        paramDict = dict(params)
    return paramDict

def response_ipn_listener(responseId):
    from ..main import app, PROD

    ipn_body = app.current_request.raw_body.decode()
    VERIFY_URL_PROD = "https://www.paypal.com/cgi-bin/webscr"
    VERIFY_URL_TEST = "https://www.sandbox.paypal.com/cgi-bin/webscr"
    sandbox = not PROD
    VERIFY_URL = VERIFY_URL_PROD if PROD else VERIFY_URL_TEST

    paramDict = parse_ipn_body(ipn_body)

    responseIdFromIpn = paramDict.get("custom", "")
    response = Response.objects.get({"_id": ObjectId(responseId)})

    def raise_ipn_error(message):
        response.payment_trail.append(
            PaymentTrailItem(
                value=paramDict,
                status="ERROR",
                date=datetime.datetime.now(),
                method="paypal_ipn",
                id=message,
            )
        )
        response.save()
        raise Exception("IPN ERROR: " + message)

    if responseId != responseIdFromIpn:
        raise_ipn_error(
            "Response ID {} does not match this endpoint: {}".format(
                responseIdFromIpn, responseId
            )
        )

    # Post back to PayPal for validation
    headers = {
        "content-type": "application/x-www-form-urlencoded",
        "host": "www.paypal.com",
    }
    r = requests.post(VERIFY_URL + "?cmd=_notify-validate", data=ipn_body, headers=headers, verify=True)
    r.raise_for_status()

    # Check return message and take action as needed
    if r.text == "VERIFIED":
        # payment_status completed.
        form = Form.objects.only("formOptions").get({"_id": response.form.id})
        expected_receiver_email = form.formOptions.paymentMethods["paypal_classic"][
            "business"
        ]
        if paramDict.get("txn_type", "") in ("subscr_signup", "subscr_cancel", "subscr_eot"):
            # Don't handle subscription signups, cancels, expiries.
            # TODO: actually handle these.
            return
        if paramDict["receiver_email"] != expected_receiver_email:
            raise_ipn_error(
                "Emails do not match. {}, {}".format(
                    paramDict["receiver_email"], expected_receiver_email
                )
            )
        txn_id = paramDict.get("txn_id", None)
        if not txn_id:
            raise_ipn_error("No IPN transaction ID.")
        if any(
            item.status == "SUCCESS"
            and item.id == txn_id
            and item.method == "paypal_ipn"
            for item in response.payment_trail
        ):
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
                id=txn_id,
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
                id=txn_id,
            )
            response.save()
        else:
            raise_ipn_error(
                "Payment_status is not supported. Only Completed and Refunded payment statuses are supported."
            )
        # Has user paid the amount owed? Checks the PENDING_UPDATE for the total amount owed, else the response itself (when not updating).
        # fullyPaid = response["IPN_TOTAL_AMOUNT"] >= response.get("PENDING_UPDATE", response)["paymentInfo"]["total"]

        # if fullyPaid and "PENDING_UPDATE" in response:
        #     # Updates value from saved pending update value and sends email.
        #     response_verify_update(response, self.TABLES.responses, form.formOptions.confirmationEmailInfo)
        # else:
        #     # update it as paid or not.
    elif r.text == "INVALID":
        raise_ipn_error("Rejected by PayPal: {}".format(VERIFY_URL))
    else:
        raise_ipn_error("IPN was neither VERIFIED nor INVALID.")

    return ""
