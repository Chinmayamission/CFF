"""
pipenv run python -m unittest tests.integration.test_formAdmin
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import CENTER_ID, TEST_SCHEMA, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE
from app import app
from tests.integration.baseTestCase import BaseTestCase
from chalicelib.models import Org, Form
import uuid


def create_org(userId):
    try:
        org = Org.objects.get({})
    except DoesNotExist:
        org = Org(cff_permissions={"a": "B"})
    org.cff_permissions = {userId: {"owner": True}}
    org.save()


class FormAdmin(BaseTestCase):
    def setUp(self):
        create_org(app.get_current_user_id())
        super(FormAdmin, self).setUp()

    def test_form_list(self):
        """List of forms that the current user can access."""
        formId = self.create_form()
        response = self.lg.handle_request(
            method="GET", path="/forms", headers={"authorization": "auth"}, body=""
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(
            set(("_id", "name", "cff_permissions", "date_created", "date_modified")),
            set(body["res"][0].keys()),
        )
        found_form = [i for i in body["res"] if i["_id"]["$oid"] == formId]
        self.assertTrue(len(found_form) > 0)

    def test_form_list_none(self):
        """When user can access no forms."""
        test_id_old = app.test_user_id
        app.test_user_id = "cm:cognitoUserPool:" + str(uuid.uuid4())
        response = self.lg.handle_request(
            method="GET", path="/forms", headers={"authorization": "auth"}, body=""
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body["res"], [])

        """Create a form and user will have access."""
        form = Form(
            name="a",
            schema={"A": "B"},
            uiSchema={"A": "B"},
            formOptions={},
            cff_permissions={app.test_user_id: {"owner": True}},
        )
        form.save()

        response = self.lg.handle_request(
            method="GET", path="/forms", headers={"authorization": "auth"}, body=""
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body["res"][0]["_id"]["$oid"], str(form.id))

        app.test_user_id = test_id_old

    def test_form_list_all_org(self):
        """When user can access all forms due to being owner of an org."""
        formId = self.create_form()
        test_id_old = app.test_user_id
        app.test_user_id = "cm:cognitoUserPool:" + str(uuid.uuid4())
        response = self.lg.handle_request(
            method="GET", path="/forms", headers={"authorization": "auth"}, body=""
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body["res"], [])

        create_org(app.test_user_id)

        response = self.lg.handle_request(
            method="GET", path="/forms", headers={"authorization": "auth"}, body=""
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        found_form = [i for i in body["res"] if i["_id"]["$oid"] == str(formId)]
        self.assertTrue(len(found_form) > 0)

        app.test_user_id = test_id_old

    def test_create_and_delete_form(self):
        formId = self.create_form()
        self.delete_form(formId)
        self.render_form(formId, fail=True)

    def test_create_and_edit_form(self):
        formId = self.create_form()
        NEW_NAME = "New name for form"
        NEW_SCHEMA = {"Schema 2": "blah"}
        edit_response = self.edit_form(formId, {"name": NEW_NAME, "schema": NEW_SCHEMA})
        self.assertEqual(edit_response["updated_values"]["name"], NEW_NAME)
        self.assertEqual(edit_response["updated_values"]["schema"], NEW_SCHEMA)
        form = self.render_form(formId)
        self.assertEqual(form["name"], NEW_NAME)
        self.assertEqual(form["schema"], NEW_SCHEMA)
