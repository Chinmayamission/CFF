"""
Used in other tests.
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from ..constants import CENTER_ID, SCHEMA_ID, TEST_SCHEMA, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE, COGNITO_IDENTITY_ID
from app import app

class SelfContainedForm(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
        body = dict(schema=TEST_SCHEMA)
        response = self.lg.handle_request(method='POST',
                                          path='/centers/{}/forms/new'.format(CENTER_ID),
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.form = body['res']['form']
        self.formId = self.form['id']
    def tearDown(self):
        response = self.lg.handle_request(method='DELETE',
                                          path='/forms/{}'.format(self.formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body, {"res": None, "success": True, "action": "delete"});
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/render'.format(self.formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 500, response)