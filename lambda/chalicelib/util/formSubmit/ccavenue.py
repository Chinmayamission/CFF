from ..ccavutil import encrypt, decrypt
from chalicelib.util.formSubmit.emailer import fill_string_from_template
from pydash.objects import get
import time
from bson.objectid import ObjectId
import shortuuid
from decimal import Decimal
from chalicelib.models import CCAvenueConfig


def update_ccavenue_hash(formId, ccavenuePaymentMethodInfo, response):
    from ...main import app

    def fill_ccavenue_paymentinfo(key):
        value = ccavenuePaymentMethodInfo.get(key)
        return fill_string_from_template(response, value) if value else None

    merchant_id = ccavenuePaymentMethodInfo["merchant_id"]

    config = CCAvenueConfig.objects.get({"merchant_id": merchant_id})
    if not config:
        raise Exception(f"CCAvenue config not found for merchant id: {merchant_id}.")

    """en - English
  hi - Hindi
  gu - Gujarati
  mr - Marathi
  bn - Bengali"""
    responseId = str(response.id)
    orderId = str(ObjectId())
    data = {
        "merchant_id": merchant_id,
        "order_id": orderId,
        "currency": response.paymentInfo["currency"],
        "amount": str(
            Decimal(response.paymentInfo["total"]) - Decimal(response.amount_paid)
        ),
        "redirect_url": app.get_url(f"responses/{responseId}/ccavenueResponseHandler"),
        "cancel_url": "http://www.chinmayamission.com",  # todo: fix this.
        "language": "en",
        "billing_name": fill_ccavenue_paymentinfo("billing_name"),
        "billing_address": fill_ccavenue_paymentinfo("billing_address"),
        "billing_city": fill_ccavenue_paymentinfo("billing_city"),
        "billing_state": fill_ccavenue_paymentinfo("billing_state"),
        "billing_zip": fill_ccavenue_paymentinfo("billing_zip"),
        "billing_country": fill_ccavenue_paymentinfo("billing_country"),
        "billing_tel": fill_ccavenue_paymentinfo("billing_tel"),
        "billing_email": fill_ccavenue_paymentinfo("billing_email"),
        "merchant_param1": formId,
        "merchant_param2": responseId,
        "merchant_param3": get(
            ccavenuePaymentMethodInfo,
            "redirectUrl",
            ccavenuePaymentMethodInfo.get(
                "redirectUrl", "http://www.chinmayamission.com"
            ),
        ),
    }
    sub_account_id = ccavenuePaymentMethodInfo.get("sub_account_id")
    if sub_account_id is not None:
        data["sub_account_id"] = sub_account_id
    # "delivery_name": "test",
    # "delivery_address": "test",
    # "delivery_city": "test",
    # "delivery_state": "test",
    # "delivery_zip": "test",
    # "delivery_country": "test",
    # "delivery_tel": "test",
    # "merchant_param1": "test",
    # "merchant_param2": "test",
    # "merchant_param3": "test",
    # "merchant_param4": "test",
    # "merchant_param5": "test",
    # "integration_type": "test",
    # "promo_code": "test",
    # "customer_identifier": "test"
    ccavenuePaymentMethodInfo["encRequest"] = encrypt(data, config.SECRET_working_key)
    ccavenuePaymentMethodInfo["access_code"] = config.access_code
    ccavenuePaymentMethodInfo["merchant_id"] = merchant_id
    return ccavenuePaymentMethodInfo


# todo: decrypt.
