"""
python -m unittest tests.integration.test_formRender
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID, FORM_V2_ID, FORM_V2_RENDER_RESP
from app import app

class FormRender(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
    def test_render_form(self):
        """Load form lists."""
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/render'.format(FORM_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertIn("value", body['res']['schema'])
        self.assertIn("value", body['res']['schemaModifier'])
        self.assertNotIn("schema_versions", body['res'])
        self.assertNotIn("schemaModifier_versions", body['res'])
    def test_render_form_with_versions(self):
        """Render form with versions (used on edit page)."""
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/render?versions=1'.format(FORM_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertIn("value", body['res']['schema'])
        self.assertIn("value", body['res']['schemaModifier'])
        self.assertIn("schema_versions", body['res'])
        self.assertIn("schemaModifier_versions", body['res'])
    def test_render_form_v2(self):
        # New type form with schema and schemaModifier.
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/render'.format(FORM_V2_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        # self.assertEqual(FORM_V2_RENDER_RESP, body['res'])
        self.assertIn("schema", body['res'])
        self.assertIn("uiSchema", body['res'])
        self.assertIn("formOptions", body['res'])
        self.assertNotIn("schemaModifier", body['res'])
        # self.assertIn("value", body['res']['schema'])
        # self.assertIn("value", body['res']['schemaModifier'])
        # self.assertNotIn("schema_versions", body['res'])
        # self.assertNotIn("schemaModifier_versions", body['res'])