"""
python -m unittest tests.unit.test_ccavutil
"""
from chalicelib.util.ccavutil import encrypt, decrypt
from chalicelib.util.formSubmit.ccavenue import update_ccavenue_hash
from chalicelib.models import Response, CCAvenueConfig
import unittest
import uuid

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
        merchant_id = str(uuid.uuid4())
        response = Response(
            amount_paid=20, paymentInfo={"currency": "INR", "total": "50"}
        )
        config = CCAvenueConfig(
            access_code="access_code",
            merchant_id=merchant_id,
            SECRET_working_key="SECRET_working_key",
        ).save()
        ccavenuePaymentMethodInfo1 = update_ccavenue_hash(
            "formId", {"merchant_id": merchant_id}, response
        )
        ccavenuePaymentMethodInfo2 = update_ccavenue_hash(
            "formId", {"merchant_id": merchant_id}, response
        )
        ccavenuePaymentMethodInfo3 = update_ccavenue_hash(
            "formId",
            {"merchant_id": merchant_id, "sub_account_id": "sub_account_id"},
            response,
        )
        response1 = decrypt(
            ccavenuePaymentMethodInfo1["encRequest"], "SECRET_working_key"
        )
        del response1["order_id"]
        response2 = decrypt(
            ccavenuePaymentMethodInfo2["encRequest"], "SECRET_working_key"
        )
        del response2["order_id"]
        response3 = decrypt(
            ccavenuePaymentMethodInfo3["encRequest"], "SECRET_working_key"
        )
        del response3["order_id"]
        self.assertEqual(response1, response2)
        self.assertNotEqual(response2, response3)

    def test_update_ccavenue_hash_with_template_avlues(self):
        merchant_id = str(uuid.uuid4())
        response = Response(
            amount_paid=20,
            paymentInfo={"currency": "INR", "total": "50"},
            value={"name": "Abc 123"},
        )
        config = CCAvenueConfig(
            access_code="access_code",
            merchant_id=merchant_id,
            SECRET_working_key="SECRET_working_key",
        ).save()
        ccavenuePaymentMethodInfo = {
            "merchant_id": merchant_id,
            "billing_name": "{{value.name}}",
            "billing_address": "{{value.name}}",
            "billing_city": "{{value.name}}",
            "billing_state": "{{value.name}}",
            "billing_zip": "{{value.name}}",
            "billing_tel": "{{value.name}}",
            "billing_email": "{{value.name}}",
        }
        response = decrypt(
            update_ccavenue_hash("formId", ccavenuePaymentMethodInfo, response)[
                "encRequest"
            ],
            "SECRET_working_key",
        )
        self.assertEqual(response["merchant_id"], merchant_id)
        self.assertEqual(response["billing_name"], "Abc 123")
        self.assertEqual(response["billing_address"], "Abc 123")
        self.assertEqual(response["billing_city"], "Abc 123")
        self.assertEqual(response["billing_state"], "Abc 123")
        self.assertEqual(response["billing_zip"], "Abc 123")
        self.assertEqual(response["billing_tel"], "Abc 123")
        self.assertEqual(response["billing_email"], "Abc 123")
