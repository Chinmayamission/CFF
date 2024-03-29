import json
from unittest import mock
from tests.integration.baseTestCase import BaseTestCase


class TestAddPayment(BaseTestCase):
    def setUp(self):
        super().setUp()
        """Create form."""
        self.formId = self.create_form()
        formOptions = {
            "paymentInfo": {
                "currency": "USD",
                "items": [
                    {"title": "A", "description": "A", "amount": "1", "quantity": "1"}
                ],
            },
            "confirmationEmailInfo": {
                "template": {"html": "test"},
                "fromName": "From",
                "from": "a@b.com",
                "subject": "Confirmation",
                "toField": ["item"],
            },
        }
        self.edit_form(
            self.formId,
            {
                "schema": {"type": "object", "additionalProperties": True},
                "uiSchema": {"title": "Test"},
                "formOptions": formOptions,
            },
        )
        self.responseId, submit_res = self.submit_form(self.formId, {"item": "data"})

    def test_add_payment(self):
        body = {
            "amount": 1,
            "currency": "USD",
            "method": "check",
            "id": "id1",
            "date": {"$date": "2019-08-10T00:43:32.291Z"},
        }
        response = self.lg.handle_request(
            method="POST",
            path=f"/responses/{self.responseId}/payment",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body["res"]["response"]["paid"], True)
        self.assertEqual(body["res"]["response"]["amount_paid"], "1.0")
        self.assertEqual(len(body["res"]["response"]["payment_trail"]), 1)
        payment_trail_item = body["res"]["response"]["payment_trail"][0]
        payment_trail_item.pop("date")
        payment_trail_item.pop("date_modified")
        payment_trail_item.pop("date_created")
        self.assertEqual(
            payment_trail_item,
            {
                "_cls": "chalicelib.models.PaymentTrailItem",
                "id": "id1",
                "method": "check",
                "status": "SUCCESS",
                "value": {"id": "id1", "method": "check", "type": "manual"},
            },
        )
        self.assertEqual(len(body["res"]["response"]["email_trail"]), 1)

    def test_add_payment_custom_email_template(self):
        formOptions = {
            "confirmationEmailTemplates": [
                {
                    "id": "template1",
                    "confirmationEmailInfo": {
                        "toField": "email",
                        "subject": "subject 123",
                        "template": {"html": "test123"},
                    },
                }
            ]
        }
        self.edit_form(
            self.formId,
            {"schema": {"a": "B"}, "uiSchema": {"a": "B"}, "formOptions": formOptions},
        )
        body = {
            "amount": 1,
            "currency": "USD",
            "method": "check",
            "id": "id1",
            "date": {"$date": "2019-08-10T00:43:32.291Z"},
            "emailTemplateId": "template1",
        }
        response = self.lg.handle_request(
            method="POST",
            path=f"/responses/{self.responseId}/payment",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body["res"]["response"]["paid"], True)
        self.assertEqual(body["res"]["response"]["amount_paid"], "1.0")
        self.assertEqual(len(body["res"]["response"]["payment_trail"]), 1)
        payment_trail_item = body["res"]["response"]["payment_trail"][0]
        payment_trail_item.pop("date")
        payment_trail_item.pop("date_modified")
        payment_trail_item.pop("date_created")
        self.assertEqual(
            payment_trail_item,
            {
                "_cls": "chalicelib.models.PaymentTrailItem",
                "id": "id1",
                "method": "check",
                "status": "SUCCESS",
                "value": {"id": "id1", "method": "check", "type": "manual"},
            },
        )
        self.assertEqual(len(body["res"]["response"]["email_trail"]), 1)

    def test_add_payment_dont_send_email(self):
        body = {
            "sendEmail": False,
            "amount": 1,
            "currency": "USD",
            "method": "check",
            "id": "id1",
            "date": {"$date": "2019-08-10T00:43:32.291Z"},
        }
        response = self.lg.handle_request(
            method="POST",
            path=f"/responses/{self.responseId}/payment",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body["res"]["response"]["paid"], True)
        self.assertEqual(body["res"]["response"]["amount_paid"], "1.0")
        self.assertEqual(len(body["res"]["response"]["payment_trail"]), 1)
        payment_trail_item = body["res"]["response"]["payment_trail"][0]
        payment_trail_item.pop("date")
        payment_trail_item.pop("date_modified")
        payment_trail_item.pop("date_created")
        self.assertEqual(
            payment_trail_item,
            {
                "_cls": "chalicelib.models.PaymentTrailItem",
                "id": "id1",
                "method": "check",
                "status": "SUCCESS",
                "value": {"id": "id1", "method": "check", "type": "manual"},
            },
        )
        self.assertTrue("email_trail" not in body["res"]["response"])

    def test_add_payment_with_notes(self):
        body = {
            "sendEmail": False,
            "notes": "Notes 123",
            "amount": 1,
            "currency": "USD",
            "method": "check",
            "id": "id1",
            "date": {"$date": "2019-08-10T00:43:32.291Z"},
        }
        response = self.lg.handle_request(
            method="POST",
            path=f"/responses/{self.responseId}/payment",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(len(body["res"]["response"]["payment_trail"]), 1)
        payment_trail_item = body["res"]["response"]["payment_trail"][0]
        payment_trail_item.pop("date")
        payment_trail_item.pop("date_modified")
        payment_trail_item.pop("date_created")
        self.assertEqual(
            payment_trail_item,
            {
                "_cls": "chalicelib.models.PaymentTrailItem",
                "notes": "Notes 123",
                "id": "id1",
                "method": "check",
                "status": "SUCCESS",
                "value": {
                    "id": "id1",
                    "method": "check",
                    "type": "manual",
                    "notes": "Notes 123",
                },
            },
        )
        self.assertTrue("email_trail" not in body["res"]["response"])
