import json
from unittest import mock
from tests.integration.baseTestCase import BaseTestCase


class TestSendEmail(BaseTestCase):
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

    def test_empty_body(self):
        body = {}
        response = self.lg.handle_request(
            method="POST",
            path=f"/responses/{self.responseId}/email",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(len(body["res"]["response"]["email_trail"]), 1)
        self.assertTrue("payment_trail" not in body["res"]["response"])

    def test_custom_email_template(self):
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
        body = {"emailTemplateId": "template1"}
        response = self.lg.handle_request(
            method="POST",
            path=f"/responses/{self.responseId}/email",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(len(body["res"]["response"]["email_trail"]), 1)
        self.assertTrue("payment_trail" not in body["res"]["response"])
