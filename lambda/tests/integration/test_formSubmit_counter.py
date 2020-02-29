"""
pipenv run python -m unittest tests.integration.test_formSubmit_counter
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
from chalicelib.models import Form, Response, FormResponseCounter
from bson.objectid import ObjectId
import time


class FormSubmitCounter(BaseTestCase):
    def test_submit_form_counter_already_exists(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "custom": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {
            "counter": {"enabled": True},
            "responseCanViewByLink": True,
            "responseCanEditByLink": True
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        FormResponseCounter(form=ObjectId(formId), counter=1).save()

        responseId, submit_res = self.submit_form(
            formId, {"participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["value"], {"participants": ["a", "b", "c"]})

        response = Response.objects.get({"_id": ObjectId(responseId)})
        self.assertEqual(response.counter, 2)

        counter = FormResponseCounter.objects.get({"form": ObjectId(formId)})
        self.assertEqual(counter.counter, 2)

        self.delete_form(formId)

    def test_submit_form_counter_create_new(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "custom": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {"counter": {"enabled": True}}
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(
            formId, {"participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["value"], {"participants": ["a", "b", "c"]})

        response = Response.objects.get({"_id": ObjectId(responseId)})
        self.assertEqual(response.counter, 1)

        counter = FormResponseCounter.objects.get({"form": ObjectId(formId)})
        self.assertEqual(counter.counter, 1)

        self.delete_form(formId)

    def test_submit_form_counter_disabled(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "custom": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {"counter": {"enabled": False}}
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        FormResponseCounter(form=ObjectId(formId), counter=1).save()

        responseId, submit_res = self.submit_form(
            formId, {"participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["value"], {"participants": ["a", "b", "c"]})

        response = Response.objects.get({"_id": ObjectId(responseId)})
        self.assertEqual(response.counter, None)

        counter = FormResponseCounter.objects.get({"form": ObjectId(formId)})
        self.assertEqual(counter.counter, 1)

        self.delete_form(formId)

    def test_submit_form_counter_disabled_and_nonexistent(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "custom": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {"counter": {"enabled": False}}
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        responseId, submit_res = self.submit_form(
            formId, {"participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["value"], {"participants": ["a", "b", "c"]})

        response = Response.objects.get({"_id": ObjectId(responseId)})
        self.assertEqual(response.counter, None)

        self.assertEqual(
            FormResponseCounter.objects.raw({"form": ObjectId(formId)}).count(), 0
        )

        self.delete_form(formId)

    def test_submit_form_counter_dont_run_on_update(self):
        formId = self.create_form()
        schema = {
            "properties": {
                "custom": {"type": "string"},
                "participants": {"type": "array", "items": {"type": "string"}},
            }
        }
        uiSchema = {"a": "b"}
        formOptions = {
            "counter": {"enabled": True},
            "responseCanViewByLink": True,
            "responseCanEditByLink": True
        }
        self.edit_form(
            formId, {"schema": schema, "uiSchema": uiSchema, "formOptions": formOptions}
        )

        FormResponseCounter(form=ObjectId(formId), counter=1).save()

        responseId, submit_res = self.submit_form(
            formId, {"participants": ["a", "b", "c"]}
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["value"], {"participants": ["a", "b", "c"]})

        response = Response.objects.get({"_id": ObjectId(responseId)})
        self.assertEqual(response.counter, 2)

        responseId, submit_res = self.submit_form(
            formId, {"participants": ["a", "b", "c"]}, responseId
        )
        self.assertEqual(submit_res["success"], True)
        self.assertEqual(submit_res["value"], {"participants": ["a", "b", "c"]})

        response = Response.objects.get({"_id": ObjectId(responseId)})
        self.assertEqual(response.counter, 2)

        counter = FormResponseCounter.objects.get({"form": ObjectId(formId)})
        self.assertEqual(counter.counter, 2)

        self.delete_form(formId)
