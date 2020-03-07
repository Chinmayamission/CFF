"""
npm test tests.integration.test_formSubmit_auth
"""
import copy
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from app import app
from pydash.objects import set_
from tests.integration.baseTestCase import BaseTestCase
from tests.integration.constants import _
from chalicelib.routes.responseIpnListener import mark_successful_payment
from chalicelib.models import Form, User, Response, CCAvenueConfig, serialize_model
from bson.objectid import ObjectId
import time
import mock
import uuid


class FormSubmitAuth(BaseTestCase):
    def view(self, responseId, auth=True):
        return self.lg.handle_request(
            method="GET",
            path="/responses/{}".format(responseId),
            headers={"authorization": "auth" if auth else "none"},
            body="",
        )

    def view_loginRequired(self, formId, auth=True):
        # used for loginRequired, to get corresponding response for form.
        return self.lg.handle_request(
            method="GET",
            path=f"/forms/{formId}/response",
            headers={"authorization": "auth" if auth else "none"},
            body="",
        )

    def edit(self, formId, responseId, auth=True):
        return self.lg.handle_request(
            method="POST",
            path=f"/forms/{formId}",
            headers={
                "authorization": "auth" if auth else "none",
                "Content-Type": "application/json",
            },
            body=json.dumps({"data": {"a": "B"}, "responseId": responseId}),
        )

    def test_default_cannot_view_edit_response_with_link(self):
        formId = self.create_form()
        self.edit_form(formId, {"schema": {"a": "B"}, "uiSchema": {"a": "B"}})
        self.set_permissions(formId, [])
        responseId, _ = self.submit_form(formId, {"a": "B"})
        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 401, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 401, response)

    def test_canViewByLink(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions": {"responseCanViewByLink": True},
            },
        )
        self.set_permissions(formId, [])
        responseId, _ = self.submit_form(formId, {"a": "B"})
        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 200, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 401, response)

    def test_canEditByLink(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions": {"responseCanEditByLink": True},
            },
        )
        self.set_permissions(formId, [])
        responseId, _ = self.submit_form(formId, {"a": "B"})
        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 401, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 200, response)

    def test_canViewByLink_and_canEditByLink(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions": {
                    "responseCanViewByLink": True,
                    "responseCanEditByLink": True,
                },
            },
        )
        self.set_permissions(formId, [])
        responseId, _ = self.submit_form(formId, {"a": "B"})
        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 200, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 200, response)

    def test_default_admin_can_view_edit(self):
        formId = self.create_form()
        self.edit_form(formId, {"schema": {"a": "B"}, "uiSchema": {"a": "B"}})
        self.set_permissions(formId, ["Responses_View", "Responses_Edit"])

        responseId, _ = self.submit_form(formId, {"a": "B"})

        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 200, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 200, response)

    def test_default_loginRequired_auth(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions": {"loginRequired": True},
            },
        )
        self.set_permissions(formId, [])
        responseId, _ = self.submit_form(formId, {"a": "B"})

        response = self.view_loginRequired(formId)
        self.assertEqual(response["statusCode"], 200, response)
        self.assertNotEqual(json.loads(response["body"])["res"], None)

        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 200, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 200, response)

    def test_default_loginRequired_others_cannot_view_modify(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions": {"loginRequired": True},
            },
        )
        self.set_permissions(formId, [])
        responseId, _ = self.submit_form(formId, {"a": "B"})

        # change owner of response
        user = User(id=str(uuid.uuid4()))
        user.save()
        response = Response.objects.get({"_id": ObjectId(responseId)})
        response.user = user
        response.save()

        response = self.view_loginRequired(formId)
        self.assertEqual(response["statusCode"], 200, response)
        self.assertEqual(json.loads(response["body"])["res"], None)

        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 401, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 401, response)

    def test_default_loginRequired_admin_can_view_modify(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions": {"loginRequired": True},
            },
        )
        self.set_permissions(formId, ["Responses_View", "Responses_Edit"])
        responseId, _ = self.submit_form(formId, {"a": "B"})

        # change owner of response
        user = User(id=str(uuid.uuid4()))
        user.save()
        response = Response.objects.get({"_id": ObjectId(responseId)})
        response.user = user
        response.save()

        response = self.view_loginRequired(formId)
        self.assertEqual(response["statusCode"], 200, response)
        self.assertEqual(json.loads(response["body"])["res"], None)

        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 200, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 200, response)

    def test_default_loginRequired_canview_canedit_by_others(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions": {
                    "loginRequired": True,
                    "responseCanViewByLink": True,
                    "responseCanEditByLink": True,
                },
            },
        )
        self.set_permissions(formId, [])
        responseId, _ = self.submit_form(formId, {"a": "B"})

        # change owner of response
        user = User(id=str(uuid.uuid4()))
        user.save()
        response = Response.objects.get({"_id": ObjectId(responseId)})
        response.user = user
        response.save()

        response = self.view(responseId)
        self.assertEqual(response["statusCode"], 200, response)

        response = self.edit(formId, responseId)
        self.assertEqual(response["statusCode"], 200, response)
