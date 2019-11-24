"""
python -m unittest tests.unit.test_ccavutil
"""
from chalicelib.util.ccavutil import encrypt, decrypt
from chalicelib.util.formSubmit.ccavenue import update_ccavenue_hash
from chalicelib.models import Response, CCAvenueConfig
import unittest

INPUT_DATA = {"a": "b"}
WORKING_KEY = "asdlkjskljasdkljas"


class TestCcavutil(unittest.TestCase):
    maxDiff = None

    def test_encrypt_decrypt(self):
        encrypted = encrypt(INPUT_DATA, WORKING_KEY)
        decrypted = decrypt(encrypted, WORKING_KEY)
        self.assertEqual(INPUT_DATA, decrypted)


class TestCcAvenue(unittest.TestCase):
    def test_update_ccavenue_hash_with_subaccount(self):
        """Does changing the subaccount id affect the response?
        """
        response = Response(
            amount_paid=20,
            paymentInfo={
                "currency": "INR",
                "total": "50"
            }
        )
        CCAvenueConfig(
            access_code="access_code",
            merchant_id="merchant_id",
            SECRET_working_key="SECRET_working_key",
        ).save()
        ccavenuePaymentMethodInfo1 = update_ccavenue_hash("formId", {"merchant_id": "merchant_id"}, response)
        ccavenuePaymentMethodInfo2 = update_ccavenue_hash("formId", {"merchant_id": "merchant_id"}, response)
        ccavenuePaymentMethodInfo3 = update_ccavenue_hash("formId", {"merchant_id": "merchant_id", "sub_account_id": "sub_account_id"}, response)
        response1 = decrypt(ccavenuePaymentMethodInfo1["encRequest"], "SECRET_working_key")
        del response1["order_id"]
        response2 = decrypt(ccavenuePaymentMethodInfo2["encRequest"], "SECRET_working_key")
        del response2["order_id"]
        response3 = decrypt(ccavenuePaymentMethodInfo3["encRequest"], "SECRET_working_key")
        del response3["order_id"]
        self.assertEqual(response1, response2)
        self.assertNotEqual(response2, response3)