"""
pipenv run python -m unittest tests.integration.test_formAdmin
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import CENTER_ID, TEST_SCHEMA, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE, COGNITO_IDENTITY_ID
from app import app



class FormAdmin(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
    def test_form_list(self):
        """List of forms that the current user can access."""
        response = self.lg.handle_request(method='GET', path='/forms', headers={}, body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])      
        self.assertEqual(set(("_id", "name", "cff_permissions")), set(body['res'][0].keys()))
    def test_form_list_none(self):
        """When user can access no forms."""
        test_id_old = app.test_user_id 
        app.test_user_id = "cff:testuserwithnothing"
        response = self.lg.handle_request(method='GET', path='/forms', headers={}, body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res'], [])
        app.test_user_id = test_id_old
    def test_create_and_delete_form(self):
        """Create form and delete it."""
        body = dict(schema=TEST_SCHEMA)
        response = self.lg.handle_request(method='POST',
                                          path='/forms',
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertIn('form', body['res'])
        self.assertIn('_id', body['res']['form'])
        self.assertIn('name', body['res']['form'])
        self.assertEqual({"owner": True}, body['res']['form']['cff_permissions'][COGNITO_IDENTITY_ID])
        self.assertEqual(body['res']['form']['version'], 1)
        DEFAULT_SCHEMA = {"title": "Form"}
        self.assertEqual(body['res']['form']['schema'], DEFAULT_SCHEMA)
        formId = body['res']['form']['_id']
        
        response = self.lg.handle_request(method='DELETE',
                                          path='/forms/{}'.format(formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body.pop("formId"), formId)
        self.assertEqual(body, {"res": None, "success": True, "action": "delete"});
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}'.format(formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 404, response)