import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from app import app
from .constants import CENTER_ID, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE, COGNITO_IDENTITY_ID

SCHEMA_ID = "5e258c2c-9b85-40ad-b764-979fc9df1740"
SCHEMA_VERSION = 3
TEST_SCHEMA = {"id": SCHEMA_ID, "version": SCHEMA_VERSION}

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
    def test_create_form(self):
        """Create form."""
        body = dict(schema=TEST_SCHEMA)
        response = self.lg.handle_request(method='POST',
                                          path='/centers/{}/forms/new'.format(CENTER_ID),
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertIn('form', body['res'])
        self.assertIn('id', body['res']['form'])
        self.assertIn('name', body['res']['form'])
        self.assertIn(COGNITO_IDENTITY_ID, body['res']['form']['cff_permissions']['owner'])
        self.assertEqual(body['res']['form']['version'], 1)
        self.assertEqual(body['res']['form']['schema'], TEST_SCHEMA)