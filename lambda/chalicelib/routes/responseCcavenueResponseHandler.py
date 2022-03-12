from botocore.exceptions import ClientError
import json
from urllib.parse import parse_qsl
from chalicelib.util.ccavutil import decrypt
from chalicelib.util.formSubmit.emailer import send_confirmation_email
from chalicelib.models import PaymentTrailItem
import chalice
import datetime
from decimal import Decimal
from pydash.objects import get
from chalicelib.models import Form, Response, CCAvenueConfig, serialize_model
from bson.objectid import ObjectId
from pymodm.errors import DoesNotExist
from .responseIpnListener import mark_successful_payment, mark_error_payment

"""
 {'order_id': '4qwjQy46tSDjYEvmdDPi4m', 'tracking_id': '307003756646', 'bank_ref_no': '1525281619352', 'order_status': 'Success', 'payment_mode': 'Net Banking', 'card_name': 'AvenuesTest', 'status_code': 'null', 'status_message': 'Y', 'currency': 'INR', 'amount': '50.0', 'billing_name': 'Ashwin Ramaswami', 'billing_address': '123 123 Lane', 'billing_city': 'Buckhead', 'billing_state': 'GA', 'billing_zip': '12302', 'billing_country': 'USA', 'billing_tel': '7705159732', 'billing_email': 'success@simulator.amazonses.com', 'merchant_param1': '031ee09a-6b40-4f5f-af66-71f71115d088', 'vault': 'N', 'offer_type': 'null', 'offer_code': 'null', 'discount_value': '0.0', 'mer_amount': '50.0', 'eci_value': 'null', 'retry': 'N', 'response_code': '0', 'trans_date': '02/05/2018 22:51:06'}
"""


def response_ccavenue_response_handler(responseId):
    from ..main import app

    response = Response.objects.get({"_id": ObjectId(responseId)})
    form = Form.objects.only("formOptions").get({"_id": response.form.id})
    formId = str(form.id)

    merchant_id = form.formOptions.paymentMethods["ccavenue"]["merchant_id"]
    try:
        config = CCAvenueConfig.objects.get({"merchant_id": merchant_id})
    except DoesNotExist:
        mark_error_payment(
            response,
            f"CCAvenue config not found for merchant id: {merchant_id}.",
            "ccavenue",
            {"raw_body": app.current_request.raw_body.decode("utf-8")}
        )

    res = dict(parse_qsl(app.current_request.raw_body.decode("utf-8")))
    paramDict = decrypt(res["encResp"], config.SECRET_working_key)
    if (
        paramDict["merchant_param1"] != formId
        or paramDict["merchant_param2"] != responseId
    ):
        mark_error_payment(
            response,
            f"Form id / response id do not match. \nExpected: {formId}/{responseId}. \nReceived: {paramDict['merchant_param1']}/{paramDict['merchant_param1']}",
            "ccavenue",
            paramDict,
        )
    if paramDict["order_status"] != "Success":
        mark_error_payment(
            response,
            f"Order status does not mark success. Expected: Success. Received: {paramDict['order_status']}",
            "ccavenue",
            paramDict,
        )
        # todo: redirect to another error page.
    elif paramDict["order_status"] == "Success":
        order_id = paramDict["order_id"]
        if any(
            item.status == "SUCCESS"
            and item.id == order_id
            and item.method == "ccavenue"
            for item in response.payment_trail
        ):
            mark_error_payment(
                response,
                f"Duplicate IPN transaction ID: {order_id}",
                "ccavenue",
                paramDict,
            )
        mark_successful_payment(
            form=form,
            response=response,
            full_value=paramDict,
            method_name="ccavenue",
            amount=paramDict["amount"],  # TODO: or mer_amount?
            currency=paramDict["currency"],
            id=paramDict["order_id"],
        )
        response.save()
        redirect_url = get(
            form.formOptions.paymentMethods,
            "ccavenue.redirectUrl",
            "http://www.chinmayamission.com",
        )
        return chalice.Response("", status_code=302, headers={"Location": redirect_url})
