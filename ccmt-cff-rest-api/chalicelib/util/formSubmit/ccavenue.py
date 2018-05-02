from ..ccavutil import encrypt, decrypt
from pydash.objects import get
import time
import shortuuid

def update_ccavenue_hash(formId, ccavenuePaymentMethodInfo, centerId, schemaModifier, response):
  from ...main import app, TABLES
  center = TABLES.centers.get_item(
    Key=dict(id=centerId),
    ProjectionExpression="paymentInfo"
  )["Item"]
  access_code = center["paymentInfo"]["ccavenue"]["access_code"]
  merchant_id = center["paymentInfo"]["ccavenue"]["merchant_id"]
  SECRET_working_key = center["paymentInfo"]["ccavenue"]["working_key"]
  """en - English
  hi - Hindi
  gu - Gujarati
  mr - Marathi
  bn - Bengali"""
  responseId = response["responseId"]
  orderId = shortuuid.uuid()
  data = {
    "merchant_id": merchant_id,
    "order_id": orderId,
    "currency": response["paymentInfo"]["currency"],
    "amount": response["paymentInfo"]["total"],
    "redirect_url": app.get_url(f"/forms/{formId}/responses/{responseId}/ccavenueResponseHandler"),
    "cancel_url": app.get_url(f"/forms/{formId}/responses/{responseId}/ccavenueResponseHandler"), # todo: fix this.
    "language": "en",
    "integration_type": "iframe_normal",
    "billing_name": ccavenuePaymentMethodInfo["billing_name"],
    "billing_address": ccavenuePaymentMethodInfo["billing_address"],
    "billing_city": ccavenuePaymentMethodInfo["billing_city"],
    "billing_state": ccavenuePaymentMethodInfo["billing_state"],
    "billing_zip": ccavenuePaymentMethodInfo["billing_zip"],
    "billing_country": ccavenuePaymentMethodInfo["billing_country"],
    "billing_tel": ccavenuePaymentMethodInfo["billing_tel"],
    "billing_email": ccavenuePaymentMethodInfo["billing_email"],
    "merchant_param1": formId,
    "merchant_param2": responseId,
    "merchant_param3": get(ccavenuePaymentMethodInfo, "redirectUrl", response["paymentInfo"]["redirectUrl"])
  }
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
  ccavenuePaymentMethodInfo["encRequest"] = encrypt(data, SECRET_working_key)
  ccavenuePaymentMethodInfo["access_code"] = access_code
  ccavenuePaymentMethodInfo["merchant_id"] = merchant_id
  return ccavenuePaymentMethodInfo

# todo: decrypt.