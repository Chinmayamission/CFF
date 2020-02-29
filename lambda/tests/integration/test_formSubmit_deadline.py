"""
npm test -- tests.integration.test_formSubmit_deadline
"""
import copy
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from app import app
from tests.integration.baseTestCase import BaseTestCase
from tests.integration.constants import _
from bson.objectid import ObjectId
import time
from freezegun import freeze_time


class FormSubmitDeadline(BaseTestCase):
    def setUp(self):
        super(FormSubmitDeadline, self).setUp()
        self.formId = self.create_form()
        formOptions = {
            "paymentInfo": {
                "currency": "USD",
                "items": [
                    {
                        "name": "Base price",
                        "description": "Base price",
                        "amount": "100",
                        "quantity": "1",
                    },
                    {
                        "name": "Early bird discount",
                        "description": "Early bird discount",
                        "amount": "-0.1 * $total",
                        "quantity": "cff_createdBetween('2019-01-01T00:00:00.000Z', '2019-01-20T00:00:00.000Z')",
                    },
                ],
            },
            "responseCanViewByLink": True,
            "responseCanEditByLink": True
        }
        self.edit_form(
            self.formId,
            {"schema": {"a": "B"}, "uiSchema": {"a": "B"}, "formOptions": formOptions},
        )

    @freeze_time("2019-01-01T00:00:00.000Z")
    def test_submit_form_before_deadline_applies_discount(self):
        responseId, submit_res = self.submit_form(self.formId, {"nationality": "India"})
        self.assertEqual(submit_res["paymentInfo"]["total"], 90)

    @freeze_time("2019-01-20T00:00:01.000Z")
    def test_submit_form_after_deadline_no_discount(self):
        responseId, submit_res = self.submit_form(self.formId, {"nationality": "India"})
        self.assertEqual(submit_res["paymentInfo"]["total"], 100)

    def test_submit_form_before_deadline_keeps_discount_after_deadline(self):
        freezer = freeze_time("2019-01-01T00:00:00.000Z")
        freezer.start()
        responseId, submit_res = self.submit_form(self.formId, {"nationality": "India"})
        self.assertEqual(submit_res["paymentInfo"]["total"], 90)
        freezer.stop()

        freeze = freeze_time("2019-01-20T00:00:01.000Z")
        _, submit_res = self.submit_form(
            self.formId, {"nationality": "India"}, responseId
        )
        self.assertEqual(submit_res["paymentInfo"]["total"], 90)


def test_submit_form_after_deadline_keeps_discount_before_deadline(self):
    # This should never happen (unless you can time travel 😁), but it should
    # still work nevertheless.
    freezer = freeze_time("2019-01-20T00:00:01.000Z")
    freezer.start()
    responseId, submit_res = self.submit_form(self.formId, {"nationality": "India"})
    self.assertEqual(submit_res["paymentInfo"]["total"], 100)
    freezer.stop()

    freeze = freeze_time("2019-01-01T00:00:00.000Z")
    _, submit_res = self.submit_form(self.formId, {"nationality": "India"}, responseId)
    self.assertEqual(submit_res["paymentInfo"]["total"], 100)
