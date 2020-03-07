"""
npm test tests.integration.test_formSubmit_email
"""
import copy
import unittest
from chalice.config import Config
import json
from app import app
from tests.integration.baseTestCase import BaseTestCase
from tests.integration.constants import _
from chalicelib.models import Form, User, Response, CCAvenueConfig, serialize_model
from bson.objectid import ObjectId
import time
import mock
import uuid

class FormSubmitEmail(BaseTestCase):
    @mock.patch("boto3.client")
    def test_submit_notpaid_no_email(self, mock_boto_client):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a":"B"},
                "uiSchema": {"a":"B"},
                "formOptions": {
                    "paymentInfo": {
                        "currency": "USD",
                        "items": [
                            {"name": "a", "description": "a", "amount": "1", "quantity": "1"}
                        ]
                    },
                    "confirmationEmailInfo": {
                        "toField": "email"
                    }
                }
            }
        )
        responseId, submit_res = self.submit_form(formId, {"email": "success@simulator.amazonses.com"})
        self.assertEqual(submit_res["paid"], False)
        self.assertEqual(submit_res["email_sent"], False)

        _, submit_res = self.submit_form(formId, {"email": "success@simulator.amazonses.com"}, responseId=responseId)
        self.assertEqual(submit_res["paid"], False)
        self.assertEqual(submit_res["email_sent"], False)

    @mock.patch("boto3.client")
    def test_submit_paid_send_email(self, mock_boto_client):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a":"B"},
                "uiSchema": {"a":"B"},
                "formOptions": {
                    "paymentInfo": {
                        "currency": "USD",
                        "items": [
                            {"name": "a", "description": "a", "amount": "0", "quantity": "0"}
                        ]
                    },
                    "confirmationEmailInfo": {
                        "toField": "email"
                    }
                }
            }
        )
        responseId, submit_res = self.submit_form(formId, {"email": "success@simulator.amazonses.com"})
        self.assertEqual(submit_res["paid"], True)
        self.assertEqual(submit_res["email_sent"], True)

        _, submit_res = self.submit_form(formId, {"email": "success@simulator.amazonses.com"}, responseId=responseId)
        self.assertEqual(submit_res["paid"], True)
        self.assertEqual(submit_res["email_sent"], True)

        _, submit_res = self.submit_form(formId, {"email": "success@simulator.amazonses.com"}, responseId=responseId, submitOptions={"sendEmail": True})
        self.assertEqual(submit_res["paid"], True)
        self.assertEqual(submit_res["email_sent"], True)

    def test_submit_paid_disable_send_email(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a":"B"},
                "uiSchema": {"a":"B"},
                "formOptions": {
                    "paymentInfo": {
                        "currency": "USD",
                        "items": [
                            {"name": "a", "description": "a", "amount": "0", "quantity": "0"}
                        ]
                    },
                    "confirmationEmailInfo": {
                        "toField": "email"
                    }
                }
            }
        )
        responseId, submit_res = self.submit_form(formId, {"email": "success@simulator.amazonses.com"}, submitOptions={"sendEmail": False})
        self.assertEqual(submit_res["paid"], True)
        self.assertEqual(submit_res["email_sent"], False)

        _, submit_res = self.submit_form(formId, {"email": "success@simulator.amazonses.com"}, responseId=responseId, submitOptions={"sendEmail": False})
        self.assertEqual(submit_res["paid"], True)
        self.assertEqual(submit_res["email_sent"], False)