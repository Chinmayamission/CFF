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
    def test_list_schemas(self):
        """Load form lists."""
        response = self.lg.handle_request(method='GET',
                                          path='/centers/{}/schemas'.format(CENTER_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "No forms returned!")
        # Do schemas have at least an id and value?
        self.assertIn("version", body['res'][0])
        self.assertIn("id", body['res'][0])
    def test_create_and_delete_form(self):
        """Create form and delete it."""
        body = dict(schema=TEST_SCHEMA)
        response = self.lg.handle_request(method='PUT',
                                          path='/forms',
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertIn('form', body['res'])
        self.assertIn('id', body['res']['form'])
        self.assertIn('name', body['res']['form'])
        self.assertEqual({"owner": True}, body['res']['form']['cff_permissions'][COGNITO_IDENTITY_ID])
        self.assertEqual(body['res']['form']['version'], 1)
        self.assertEqual(body['res']['form']['schema'], TEST_SCHEMA)
        formId = body['res']['form']['id']
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/render'.format(formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res']['id'], formId)
        response = self.lg.handle_request(method='DELETE',
                                          path='/forms/{}'.format(formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body, {"res": None, "success": True, "action": "delete"});
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/render'.format(formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 500, response)