"""
pipenv run python -m unittest tests.integration.test_formSubmit
"""
import copy
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import ONE_SCHEMA, ONE_UISCHEMA, ONE_FORMOPTIONS, ONE_FORMDATA
from app import app
from pydash.objects import set_
from tests.integration.baseTestCase import BaseTestCase
from tests.integration.constants import _
from chalicelib.routes.responseIpnListener import mark_successful_payment
from chalicelib.models import Form, Response, CCAvenueConfig, serialize_model
from bson.objectid import ObjectId
import time
from unittest import mock
import uuid

ONE_SUBMITRES = {
    "paid": False,
    "success": True,
    "action": "insert",
    "email_sent": False,
    "paymentInfo": {
        "currency": "USD",
        "items": [
            {
                "amount": 0.5,
                "description": "Base Registration",
                "name": "Base Registration",
                "quantity": 1.0,
                "total": 0.5,
            }
        ],
        "total": 0.5,
    },
    "amount_owed_cents": 50,
    "paymentMethods": {
        "paypal_classic": {
            "address1": "123",
            "address2": "asdad",
            "business": "aramaswamis-facilitator@gmail.com",
            "city": "Atlanta",
            "cmd": "_cart",
            "email": "success@simulator.amazonses.com",
            "first_name": "Ashwin",
            "image_url": "http://www.chinmayanewyork.org/wp-content/uploads/2014/08/banner17_ca1.png",
            "last_name": "Ash",
            "payButtonText": "Pay Now",
            "sandbox": False,
            "state": "GA",
            "zip": "30022",
        }
    },
}


def remove_date(data):
    return {k: v for k, v in data.items() if k != "date"}


class FormSubmit(BaseTestCase):
    maxDiff = None

    def setUp(self):
        super(FormSubmit, self).setUp()
        self.formId = self.create_form()
        self.edit_form(
            self.formId,
            {
                "schema": ONE_SCHEMA,
                "uiSchema": ONE_UISCHEMA,
                "formOptions": ONE_FORMOPTIONS,
            },
        )

    def test_submit_form_one(self):
        """Submit form."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)
        self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)

        """View response."""
        response = self.view_response(responseId)
        self.assertEqual(response["value"], ONE_FORMDATA)


    def test_submit_form_modify_link_custom(self):
        """Submitting a form and specifying modifyLink should save that link to the response."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA, extra_body={"modifyLink": "http://modify"})
        self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)
        
        response = Response.objects.get({"_id": ObjectId(responseId)})
        self.assertEqual(response.modifyLink, f"http://modify?responseId={responseId}")
        response = self.view_response(responseId)
        self.assertEqual(response["value"], ONE_FORMDATA)


    def test_submit_form_modify_link_configured(self):
        """Submitting a form that already has formOptions.modifyLink configured should use that link as the response."""
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": ONE_SCHEMA,
                "uiSchema": ONE_UISCHEMA,
                "formOptions": dict(ONE_FORMOPTIONS, modifyLink="http://modify2"),
            },
        )

        for eb in [{"modifyLink": "http://modify3"}, {}]:
            responseId, submit_res = self.submit_form(formId, ONE_FORMDATA, extra_body=eb)
            self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
            self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
            self.assertIn("paymentMethods", submit_res)

            response = Response.objects.get({"_id": ObjectId(responseId)})
            self.assertEqual(response.modifyLink, f"http://modify2?responseId={responseId}")
            response = self.view_response(responseId)
            self.assertEqual(response["value"], ONE_FORMDATA)


    def test_submit_form_currencyTemplate(self):
        formOptions = {
            "paymentInfo": {
                "currencyTemplate": "{% if value.nationality == 'India' %}INR{% else %}USD{% endif %}",
                "items": [
                    {
                        "name": "Name",
                        "description": "Description",
                        "amount": "100",
                        "quantity": "1",
                    }
                ],
            }
        }
        self.edit_form(
            self.formId,
            {"schema": {"a": "B"}, "uiSchema": {"a": "B"}, "formOptions": formOptions},
        )

        responseId, submit_res = self.submit_form(self.formId, {"nationality": "India"})

        expected_paymentInfo = {
            "currency": "INR",
            "items": [
                {
                    "name": "Name",
                    "description": "Description",
                    "amount": 100.0,
                    "quantity": 1.0,
                    "total": 100.0,
                }
            ],
            "total": 100.0,
        }
        self.assertEqual(submit_res["paymentInfo"], expected_paymentInfo)
        response = Response.objects.get({"_id": ObjectId(responseId)})
        self.assertEqual(response.paymentInfo, expected_paymentInfo)

    def test_submit_form_proper_recurrence_paymentInfo(self):
        """Submit form."""
        formOptions = {
            "paymentInfo": {
                "currency": "USD",
                "items": [
                    {
                        "name": "Name",
                        "description": "Description",
                        "amount": "100",
                        "quantity": "1",
                        "recurrenceDuration": "1M",
                        "recurrenceTimes": "3",
                    }
                ],
            }
        }
        self.edit_form(
            self.formId,
            {"schema": {"a": "B"}, "uiSchema": {"a": "B"}, "formOptions": formOptions},
        )

        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)

        expected_paymentInfo = {
            "currency": "USD",
            "items": [
                {
                    "name": "Name",
                    "description": "Description",
                    "amount": 100.0,
                    "quantity": 1.0,
                    "recurrenceDuration": "1M",
                    "recurrenceTimes": "3",
                    "total": 100.0,
                }
            ],
            "total": 100.0,
        }
        self.assertEqual(submit_res["paymentInfo"], expected_paymentInfo)

    def test_submit_form_proper_recurrence_installment_paymentInfo(self):
        """Submit form."""
        formOptions = {
            "paymentInfo": {
                "currency": "USD",
                "items": [
                    {
                        "name": "Name",
                        "description": "Description",
                        "amount": "100",
                        "quantity": "1",
                        "recurrenceDuration": "1M",
                        "recurrenceTimes": "3",
                        "installment": True,
                    }
                ],
            }
        }
        self.edit_form(
            self.formId,
            {"schema": {"a": "B"}, "uiSchema": {"a": "B"}, "formOptions": formOptions},
        )

        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)

        expected_paymentInfo = {
            "currency": "USD",
            "items": [
                {
                    "name": "Name",
                    "description": "Description",
                    "amount": 100.0,
                    "quantity": 1.0,
                    "recurrenceDuration": "1M",
                    "recurrenceTimes": "3",
                    "total": 300.0,
                    "installment": True,
                }
            ],
            "total": 0,
        }
        self.assertEqual(submit_res["paymentInfo"], expected_paymentInfo)

    def test_submit_form_with_update_no_login_required(self):
        """Submit form."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)
        self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)

        """View response."""
        response = self.view_response(responseId)
        self.assertEqual(response["value"], ONE_FORMDATA)
        self.assertEqual(response["paid"], False)
        self.assertTrue(response.get("user", None) == None)

        expected_data = copy.deepcopy(ONE_FORMDATA)
        set_(expected_data, "contact_name.last", "NEW_LAST2")

        response = self.lg.handle_request(
            method="POST",
            path=f"/forms/{self.formId}",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps({"data": expected_data, "responseId": responseId}),
        )
        self.assertEqual(response["statusCode"], 200, response)
        response = self.view_response(responseId)
        self.assertEqual(response["value"], expected_data)
        self.assertEqual(response["paid"], False)

    def test_submit_form_update_unpaid_to_paid(self):
        """Submit form."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)
        self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)

        """View response."""
        response = self.view_response(responseId)
        self.assertEqual(response["value"], ONE_FORMDATA)
        self.assertEqual(response["paid"], False)
        self.assertTrue(response.get("user", None) == None)

        # Pay response.
        response = Response.objects.get({"_id": ObjectId(responseId)})
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            response=response,
            full_value={"a2": "b2", "c2": "d2"},
            method_name="unittest_ipn",
            amount=0.5,
            currency="USD",
            id="payment1",
        )
        response.save()

        response = self.view_response(responseId)
        self.assertEqual(response["paid"], True)
        self.assertEqual(response["amount_paid"], "0.5")
        self.assertEqual(response["paymentInfo"]["total"], 0.5)
        self.assertEqual(response["amount_owed_cents"], 50)

        new_data = dict(ONE_FORMDATA, children=[{}])

        response = self.lg.handle_request(
            method="POST",
            path=f"/forms/{self.formId}",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps({"data": new_data, "responseId": responseId}),
        )

        self.assertEqual(response["statusCode"], 200, response)
        response = self.view_response(responseId)
        self.assertEqual(response["value"], new_data)
        self.assertEqual(response["paid"], False)
        self.assertEqual(response["amount_paid"], "0.5")
        self.assertEqual(response["paymentInfo"]["total"], 25.5)
        self.assertEqual(response["amount_owed_cents"], 2550)

        # Pay response.
        response = Response.objects.get({"_id": ObjectId(responseId)})
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            response=response,
            full_value={"a2": "b2", "c2": "d2"},
            method_name="unittest_ipn",
            amount=25,
            currency="USD",
            id="payment2",
        )
        response.save()

        response = self.view_response(responseId)
        self.assertEqual(response["value"], new_data)
        self.assertEqual(response["paid"], True)
        self.assertEqual(response["amount_paid"], "25.5")
        self.assertEqual(response["paymentInfo"]["total"], 25.5)

    def test_submit_form_coupon_codes_not_successful(self):
        formId = self.create_form()
        schema = {"properties": {"couponCode": {"type": "string"}}}
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-1 * $total",
                        "quantity": "couponCode:CODE",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(formId, {"couponCode": "BLAH"})
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["paid"], False)
        self.assertEqual(submit_res["email_sent"], False)
        self.assertEqual(submit_res["paymentInfo"]["total"], 1.0)
        self.assertEqual(len(submit_res["paymentInfo"]["items"]), 1)
        self.delete_form(formId)

    def test_submit_form_coupon_codes_full_off_successful(self):
        formId = self.create_form()
        schema = {"properties": {"couponCode": {"type": "string"}}}
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-1 * $total",
                        "quantity": "$couponCode:CODE",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(formId, {"couponCode": "CODE"})
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["paid"], True)
        self.assertEqual(
            submit_res["email_sent"], False
        )  # confirmationEmailInfo is undefined
        self.assertEqual(submit_res["paymentInfo"]["total"], 0)
        self.assertEqual(len(submit_res["paymentInfo"]["items"]), 2)
        self.delete_form(formId)

    def test_submit_form_coupon_codes_partial_off_successful(self):
        formId = self.create_form()
        schema = {"properties": {"couponCode": {"type": "string"}}}
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-0.5 * $total",
                        "quantity": "$couponCode:CODE",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(formId, {"couponCode": "CODE"})
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["paid"], False)
        self.assertEqual(submit_res["email_sent"], False)
        self.assertEqual(submit_res["paymentInfo"]["total"], 0.5)
        self.assertEqual(len(submit_res["paymentInfo"]["items"]), 2)
        self.delete_form(formId)

    def test_submit_form_coupon_codes_constant_off_successful(self):
        formId = self.create_form()
        schema = {"properties": {"couponCode": {"type": "string"}}}
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-0.2",
                        "quantity": "$couponCode:CODE",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(formId, {"couponCode": "CODE"})
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["paid"], False)
        self.assertEqual(submit_res["email_sent"], False)
        self.assertEqual(submit_res["paymentInfo"]["total"], 0.8)
        self.assertEqual(len(submit_res["paymentInfo"]["items"]), 2)
        self.delete_form(formId)

    def test_submit_form_coupon_codes_limit_failure(self):
        formId = self.create_form()
        schema = {"properties": {"couponCode": {"type": "string"}}}
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-0.2",
                        "quantity": "$couponCode:CODE",
                        "couponCodeMaximum": "0",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(formId, {"couponCode": "CODE"})
        self.assertEqual(submit_res["success"], False)
        self.assertEqual(submit_res["fields_to_clear"], ["couponCode"])
        self.assertIn("Number of spots remaining: 0", submit_res["message"])
        self.delete_form(formId)

    def test_submit_form_coupon_codes_limit_failure_with_amount_total(self):
        formId = self.create_form()
        schema = {"properties": {"couponCode": {"type": "string"}}}
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-1 * $total",
                        "quantity": "$couponCode:CODE",
                        "couponCodeMaximum": "0",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(formId, {"couponCode": "CODE"})
        self.assertEqual(submit_res["success"], False)
        self.assertEqual(submit_res["fields_to_clear"], ["couponCode"])
        self.assertIn("Number of spots remaining: 0", submit_res["message"])
        self.delete_form(formId)

    def test_submit_form_coupon_codes_limit_success(self):
        formId = self.create_form()
        schema = {"properties": {"couponCode": {"type": "string"}}}
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-0.2",
                        "quantity": "$couponCode:CODE",
                        "couponCodeMaximum": "5",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(formId, {"couponCode": "CODE"})
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["paid"], False)
        self.assertEqual(submit_res["email_sent"], False)
        self.assertEqual(submit_res["paymentInfo"]["total"], 0.8)
        self.assertEqual(len(submit_res["paymentInfo"]["items"]), 2)
        self.delete_form(formId)

    def test_submit_form_coupon_codes_limit_with_count_fail(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "couponCode": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-0.2",
                        "quantity": "$couponCode:CODE",
                        "couponCodeMaximum": "2",
                        "couponCodeCount": "$participants",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(
            formId, {"couponCode": "CODE", "participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], False)
        self.assertEqual(submit_res["fields_to_clear"], ["couponCode"])
        self.assertIn("Number of spots remaining: 2", submit_res["message"])
        self.delete_form(formId)

    def test_submit_form_coupon_codes_limit_with_count_success(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "couponCode": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    },
                    {
                        "amount": "-0.2",
                        "quantity": "$couponCode:CODE",
                        "couponCodeMaximum": "10",
                        "couponCodeCount": "$participants",
                        "couponCode": "CODE",
                        "name": "Coupon Code Name",
                        "description": "Coupon Code Description",
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(
            formId, {"couponCode": "CODE", "participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["paid"], False)
        self.assertEqual(submit_res["email_sent"], False)
        self.assertEqual(submit_res["paymentInfo"]["total"], 0.8)
        self.assertEqual(len(submit_res["paymentInfo"]["items"]), 2)
        self.delete_form(formId)

    def test_submit_form_postprocess(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "custom": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {
            "postprocess": {
                "patches": [
                    {
                        "type": "patch",
                        "value": [{"op": "add", "path": "/custom", "value": 3}],
                    },
                    {
                        "type": "patch",
                        "expr": True,
                        "value": [
                            {"op": "add", "path": "/custom2", "expr": "participants"},
                            {"op": "add", "path": "/date1", "expr": "'2000-10-20'"},
                        ],
                    },
                    {
                        "type": "patch",
                        "expr": True,
                        "value": [
                            {
                                "op": "add",
                                "path": "/date2",
                                "expr": "cff_addDuration(CFF_FULL_date1, 'P1M')",
                            }
                        ],
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(
            formId, {"participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(
            submit_res["value"],
            {
                "participants": ["a", "b", "c"],
                "custom": 3,
                "custom2": 3,
                "date1": "2000-10-20",
                "date2": "2000-11-20",
            },
        )
        self.delete_form(formId)

    def test_submit_form_postprocess(self):
        formId = self.create_form()
        schema = {"type": "object"}
        uiSchema = {"a": "b"}
        formOptions = {
            "postprocess": {
                "patches": [
                    {
                        "type": "patch",
                        "value": [
                            {"op": "remove", "path": "/membership_type_previous"}
                        ],
                    },
                    {
                        "type": "patch",
                        "value": [
                            {"op": "test", "path": "/parivar_active", "value": True},
                            {
                                "op": "copy",
                                "from": "/membership_type",
                                "path": "/membership_type_previous",
                            },
                        ],
                    },
                ]
            }
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(
            formId,
            {
                "parivar_active": True,
                "membership_type_previous": "none",
                "membership_type": "parivar_yearly",
            },
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(
            submit_res["value"],
            {
                "parivar_active": True,
                "membership_type_previous": "parivar_yearly",
                "membership_type": "parivar_yearly",
            },
        )
        self.delete_form(formId)

    def test_submit_form_paymentInfo_description_template(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "custom": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentInfo": {"description": "Hello {{value.participants[0]}}!"}
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(
            formId, {"participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["paymentInfo"]["description"], "Hello a!")

        # Update form.
        responseId, submit_res = self.submit_form(
            formId, {"participants": ["d", "e", "f"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["paymentInfo"]["description"], "Hello d!")

        self.delete_form(formId)

    def test_edit_response(self):
        """Create form."""
        self.formId = self.create_form()
        self.edit_form(
            self.formId,
            {
                "schema": ONE_SCHEMA,
                "uiSchema": ONE_UISCHEMA,
                "formOptions": dict(ONE_FORMOPTIONS, loginRequired=True),
            },
        )

        """Submit form."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)
        self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)

        """View response."""
        response = self.view_response(responseId)
        self.assertEqual(response["value"], ONE_FORMDATA)

        responseIdNew, submit_res = self.submit_form(
            self.formId, ONE_FORMDATA, responseId
        )
        self.assertEqual(responseIdNew, responseId)
        self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
        self.assertEqual(
            submit_res,
            {
                "paid": False,
                "amt_received": {"currency": "USD", "total": 0.0},
                "success": True,
                "action": "update",
                "email_sent": False,
                "paymentInfo": {
                    "currency": "USD",
                    "items": [
                        {
                            "amount": 0.5,
                            "description": "Base Registration",
                            "name": "Base Registration",
                            "quantity": 1.0,
                            "total": 0.5,
                        }
                    ],
                    "total": 0.5,
                },
                "amount_owed_cents": 50,
                "paymentMethods": {
                    "paypal_classic": {
                        "address1": "123",
                        "address2": "asdad",
                        "business": "aramaswamis-facilitator@gmail.com",
                        "city": "Atlanta",
                        "cmd": "_cart",
                        "email": "success@simulator.amazonses.com",
                        "first_name": "Ashwin",
                        "image_url": "http://www.chinmayanewyork.org/wp-content/uploads/2014/08/banner17_ca1.png",
                        "last_name": "Ash",
                        "payButtonText": "Pay Now",
                        "sandbox": False,
                        "state": "GA",
                        "zip": "30022",
                    }
                },
            },
        )

        """Edit response."""
        body = {"path": "contact_name.last", "value": "NEW_LAST!"}
        response = self.lg.handle_request(
            method="PATCH",
            path=f"/responses/{responseId}",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        expected_data = copy.deepcopy(ONE_FORMDATA)
        set_(expected_data, "contact_name.last", "NEW_LAST!")
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body["res"]["response"]["value"], expected_data)
        self.assertEqual(
            [remove_date(i) for i in body["res"]["response"]["update_trail"]],
            [
                {
                    "old": {
                        "contact_name": {"first": "Ashwin", "last": "Ash"},
                        "address": {
                            "line1": "123",
                            "line2": "asdad",
                            "city": "Atlanta",
                            "state": "GA",
                            "zipcode": "30022",
                        },
                        "email": "success@simulator.amazonses.com",
                        "phone": "1231231233",
                        "amount": 0.5,
                        "subscribe": True,
                    },
                    "new": {
                        "contact_name": {"first": "Ashwin", "last": "Ash"},
                        "address": {
                            "line1": "123",
                            "line2": "asdad",
                            "city": "Atlanta",
                            "state": "GA",
                            "zipcode": "30022",
                        },
                        "email": "success@simulator.amazonses.com",
                        "phone": "1231231233",
                        "amount": 0.5,
                        "subscribe": True,
                    },
                    "update_type": "update",
                    "_cls": "chalicelib.models.UpdateTrailItem",
                },
                {
                    "path": "contact_name.last",
                    "user": "cm:cognitoUserPool:f31c1cb8-681c-4d3e-9749-d7c074ffd7f6",
                    "old_value": "Ash",
                    "new_value": "NEW_LAST!",
                    "response_base_path": "value",
                    "_cls": "chalicelib.models.UpdateTrailItem",
                },
            ],
        )

    def test_edit_response_admin_info(self):
        """Create form."""
        self.formId = self.create_form()
        self.edit_form(
            self.formId,
            {
                "schema": ONE_SCHEMA,
                "uiSchema": ONE_UISCHEMA,
                "formOptions": dict(ONE_FORMOPTIONS, loginRequired=True),
            },
        )

        """Submit form."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)
        self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)

        """View response."""
        response = self.view_response(responseId)
        self.assertEqual(response["value"], ONE_FORMDATA)

        responseIdNew, submit_res = self.submit_form(
            self.formId, ONE_FORMDATA, responseId
        )
        self.assertEqual(responseIdNew, responseId)
        self.assertEqual(submit_res.pop("value"), ONE_FORMDATA)
        self.assertEqual(
            submit_res,
            {
                "paid": False,
                "amt_received": {"currency": "USD", "total": 0.0},
                "success": True,
                "action": "update",
                "email_sent": False,
                "paymentInfo": {
                    "currency": "USD",
                    "items": [
                        {
                            "amount": 0.5,
                            "description": "Base Registration",
                            "name": "Base Registration",
                            "quantity": 1.0,
                            "total": 0.5,
                        }
                    ],
                    "total": 0.5,
                },
                "amount_owed_cents": 50,
                "paymentMethods": {
                    "paypal_classic": {
                        "address1": "123",
                        "address2": "asdad",
                        "business": "aramaswamis-facilitator@gmail.com",
                        "city": "Atlanta",
                        "cmd": "_cart",
                        "email": "success@simulator.amazonses.com",
                        "first_name": "Ashwin",
                        "image_url": "http://www.chinmayanewyork.org/wp-content/uploads/2014/08/banner17_ca1.png",
                        "last_name": "Ash",
                        "payButtonText": "Pay Now",
                        "sandbox": False,
                        "state": "GA",
                        "zip": "30022",
                    }
                },
            },
        )

        """Edit response's admin info."""
        body = {"path": "orderId", "value": "123"}
        response = self.lg.handle_request(
            method="PATCH",
            path=f"/responses/{responseId}/admin_info",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        expected_data = {"orderId": "123"}
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body["res"]["response"]["admin_info"], expected_data)
        self.assertEqual(
            [remove_date(i) for i in body["res"]["response"]["update_trail"]],
            [
                {
                    "old": {
                        "contact_name": {"first": "Ashwin", "last": "Ash"},
                        "address": {
                            "line1": "123",
                            "line2": "asdad",
                            "city": "Atlanta",
                            "state": "GA",
                            "zipcode": "30022",
                        },
                        "email": "success@simulator.amazonses.com",
                        "phone": "1231231233",
                        "amount": 0.5,
                        "subscribe": True,
                    },
                    "new": {
                        "contact_name": {"first": "Ashwin", "last": "Ash"},
                        "address": {
                            "line1": "123",
                            "line2": "asdad",
                            "city": "Atlanta",
                            "state": "GA",
                            "zipcode": "30022",
                        },
                        "email": "success@simulator.amazonses.com",
                        "phone": "1231231233",
                        "amount": 0.5,
                        "subscribe": True,
                    },
                    "update_type": "update",
                    "_cls": "chalicelib.models.UpdateTrailItem",
                },
                {
                    "path": "orderId",
                    "user": "cm:cognitoUserPool:f31c1cb8-681c-4d3e-9749-d7c074ffd7f6",
                    "old_value": "123",
                    "new_value": "123",
                    "response_base_path": "admin_info",
                    "_cls": "chalicelib.models.UpdateTrailItem",
                },
            ],
        )

    def test_mark_successful_payment(self):
        responseId, _ = self.submit_form(self.formId, ONE_FORMDATA)
        response = Response.objects.get({"_id": ObjectId(responseId)})
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            response=response,
            full_value={"a": "b", "c": "d"},
            method_name="unittest_ipn",
            amount=0.5,
            currency="USD",
            id="payment1",
        )
        response.save()
        self.assertEqual(paid, True)
        response = self.view_response(responseId)
        response["payment_trail"][0].pop("date")
        response["payment_trail"][0].pop("date_created")
        response["payment_trail"][0].pop("date_modified")
        self.assertEqual(
            response["payment_trail"],
            [
                {
                    "value": {"a": "b", "c": "d"},
                    "method": "unittest_ipn",
                    "status": "SUCCESS",
                    "id": "payment1",
                    "_cls": "chalicelib.models.PaymentTrailItem",
                }
            ],
        )
        self.assertEqual(response["paid"], True)
        self.assertEqual(response["amount_paid"], "0.5")
        self.assertEqual(response["amount_paid_cents"], 50)
        self.assertEqual(len(response["email_trail"]), 1)

    def test_mark_successful_payment_custom_email_template(self):
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
            ],
            "responseCanViewByLink": True,
            "responseCanEditByLink": True,
        }
        self.edit_form(
            self.formId,
            {"schema": {"a": "B"}, "uiSchema": {"a": "B"}, "formOptions": formOptions},
        )

        responseId, _ = self.submit_form(self.formId, ONE_FORMDATA)
        response = Response.objects.get({"_id": ObjectId(responseId)})
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            response=response,
            full_value={"a": "b", "c": "d"},
            method_name="unittest_ipn",
            amount=0.5,
            currency="USD",
            id="payment1",
            email_template_id="template1",
        )
        response.save()
        self.assertEqual(paid, True)
        response = self.view_response(responseId)
        response["payment_trail"][0].pop("date")
        response["payment_trail"][0].pop("date_created")
        response["payment_trail"][0].pop("date_modified")
        self.assertEqual(
            response["payment_trail"],
            [
                {
                    "value": {"a": "b", "c": "d"},
                    "method": "unittest_ipn",
                    "status": "SUCCESS",
                    "id": "payment1",
                    "_cls": "chalicelib.models.PaymentTrailItem",
                }
            ],
        )
        self.assertEqual(response["paid"], True)
        self.assertEqual(response["amount_paid"], "0.5")
        self.assertEqual(len(response["email_trail"]), 1)

    def test_mark_successful_payment_dont_send_email(self):
        responseId, _ = self.submit_form(self.formId, ONE_FORMDATA)
        response = Response.objects.get({"_id": ObjectId(responseId)})
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            response=response,
            full_value={"a": "b", "c": "d"},
            method_name="unittest_ipn",
            amount=0.5,
            currency="USD",
            id="payment1",
            send_email=False,
        )
        response.save()
        self.assertEqual(paid, True)
        response = self.view_response(responseId)
        response["payment_trail"][0].pop("date")
        response["payment_trail"][0].pop("date_created")
        response["payment_trail"][0].pop("date_modified")
        self.assertEqual(
            response["payment_trail"],
            [
                {
                    "value": {"a": "b", "c": "d"},
                    "method": "unittest_ipn",
                    "status": "SUCCESS",
                    "id": "payment1",
                    "_cls": "chalicelib.models.PaymentTrailItem",
                }
            ],
        )
        self.assertEqual(response["paid"], True)
        self.assertEqual(response["amount_paid"], "0.5")
        self.assertTrue("email_trail" not in response)

    def test_mark_successful_payment_2(self):
        responseId, _ = self.submit_form(self.formId, ONE_FORMDATA)
        response = Response.objects.get({"_id": ObjectId(responseId)})
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            response=response,
            full_value={"a2": "b2", "c2": "d2"},
            method_name="unittest_ipn2",
            amount=0.6,
            currency="USD",
            id="payment2",
        )
        response.save()
        self.assertEqual(paid, True)
        response = self.view_response(responseId)
        response["payment_trail"][0].pop("date")
        response["payment_trail"][0].pop("date_created")
        response["payment_trail"][0].pop("date_modified")
        self.assertEqual(
            response["payment_trail"],
            [
                {
                    "value": {"a2": "b2", "c2": "d2"},
                    "method": "unittest_ipn2",
                    "status": "SUCCESS",
                    "id": "payment2",
                    "_cls": "chalicelib.models.PaymentTrailItem",
                }
            ],
        )
        self.assertEqual(response["paid"], True)
        self.assertEqual(response["amount_paid"], "0.6")

    @unittest.skip("Need to make this test later.")
    def test_mark_successful_payment_not_full(self):
        responseId, _ = self.submit_form(self.formId, ONE_FORMDATA)
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            responseId=responseId,
            full_value={"a": "b", "c": "d"},
            method_name="unittest_ipn",
            amount=0.4,
            currency="USD",
            id="payment2",
        )
        # self.assertEqual(paid, False)
        # response = self.view_response(responseId)
        # response['payment_trail'][0].pop("date")
        # self.assertEqual(response['payment_history_full'], [{'value': {'a': 'b', 'c': 'd'}, 'method': 'unittest_ipn', 'status': 'SUCCESS', 'id': 'payment2', '_cls': 'chalicelib.models.PaymentTrailItem'}])
        # self.assertEqual(response['paid'], False)
        # self.assertEqual(response['amount_paid'], "0.4")
        # todo: add more tests for other parts of response.

    def test_submit_form_ccavenue(self):
        self.formId = self.create_form()
        access_code = "ACCESSKODE"
        merchant_id = str(uuid.uuid4())
        SECRET_working_key = "abcdefgh"
        config = CCAvenueConfig(
            access_code=access_code,
            merchant_id=merchant_id,
            SECRET_working_key=SECRET_working_key,
        ).save()
        schema = {"type": "object"}
        uiSchema = {"a": "b"}
        formOptions = {
            "paymentMethods": {"ccavenue": {"merchant_id": merchant_id}},
            "paymentInfo": {
                "currency": "INR",
                "items": [
                    {
                        "amount": "1",
                        "quantity": "1",
                        "name": "Name",
                        "description": "Description",
                    }
                ],
            },
        }
        self.edit_form(
            self.formId,
            {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions},
        )

        responseId, submit_res = self.submit_form(self.formId, {"a": "B"})
        ccavenue = submit_res["paymentMethods"]["ccavenue"]
        self.assertEqual(ccavenue["access_code"], access_code)
        self.assertEqual(ccavenue["merchant_id"], merchant_id)
        self.assertIn("encRequest", ccavenue)
        self.assertTrue(
            type(ccavenue["encRequest"]) is str and len(ccavenue["encRequest"]) > 0
        )  # can't predict this because it's...nondeterministic

    # def test_submit_form_manual_approval(self):
    #     # todo.
    #     pass
    # def test_submit_form_v2_manual(self):
    #     """Load form lists."""
    #     form_data = dict(FORM_DATA_ONE, email="success@simulator.amazonses.com")
    #     response = self.lg.handle_request(method='POST',
    #                                       path='/forms/{}/responses'.format(FORM_V2_ID),
    #                                       headers={"authorization": "auth","Content-Type": "application/json"},
    #                                       body=json.dumps(form_data))
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     responseId = body['res'].pop("id")
    #     self.assertEqual(body['res'], FORM_V2_SUBMIT_RESP)
    #     """View response."""
    #     response = self.lg.handle_request(method='GET',
    #                                       path='/forms/{}/responses/{}/view'.format(FORM_V2_ID, responseId),
    #                                       headers={"authorization": "auth",},
    #                                       body='')
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     self.assertEqual(body['res']['value'], form_data['data'])
    def test_mark_successful_payment_recurring(self):
        # Should set recurring_active to true.
        pass

    def test_mark_successful_payment_refund(self):
        pass
