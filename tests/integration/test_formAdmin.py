"""
pipenv run python -m unittest tests.integration.test_formAdmin
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import CENTER_ID, TEST_SCHEMA, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE, COGNITO_IDENTITY_ID
from app import app
from tests.integration.baseTestCase import BaseTestCase


class FormAdmin(BaseTestCase):
    def test_form_list(self):
        """List of forms that the current user can access."""
        response = self.lg.handle_request(method='GET', path='/forms', headers={"authorization": "auth",}, body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])      
        self.assertEqual(set(("_id", "name", "cff_permissions")), set(body['res'][0].keys()))
    def test_form_list_none(self):
        """When user can access no forms."""
        test_id_old = app.test_user_id 
        app.test_user_id = "cff:testuserwithnothing"
        response = self.lg.handle_request(method='GET', path='/forms', headers={"authorization": "auth",}, body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res'], [])
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