"""
python -m unittest tests.integration.test_formRender
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID
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
    def test_render_form_uischema_schema(self):
        formId = "e211731b-97f4-40ff-8ff6-9658d711d1a0"
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/render'.format(formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        EXPECTED = {'version': 1.0, 'uiSchema': {'phone': {'ui:widget': 'phone', 'ui:placeholder': 'Phone Number'}}, 'schema': {'description': 'Contact form.', 'ui:order': ['contact_name', 'email', 'phone', 'area_expertise', 'books_authored', 'papers_authored'], 'title': 'Form with uiSchema and schema inline (Academicians Contact Form)', 'type': 'object', 'definitions': {'name': {'ui:order': ['first', 'last'], 'title': ' ', 'type': 'object', 'properties': {'last': {'title': 'Last Name', 'type': 'string', 'classNames': 'twoColumn'}, 'first': {'title': 'First Name', 'type': 'string', 'classNames': 'twoColumn'}}}}, 'properties': {'area_expertise': {'type': 'string'}, 'contact_name': {'ui:order': ['first', 'last'], 'title': 'Contact Name', 'type': 'object', 'properties': {'last': {'ui:cff:nonModifiable': True, 'classNames': 'twoColumn', 'title': 'Last Name', 'type': 'string'}, 'first': {'ui:cff:nonModifiable': True, 'classNames': 'twoColumn', 'title': 'First Name', 'type': 'string'}}}, 'papers_authored': {'type': 'array', 'items': {'type': 'string'}}, 'phone': {'title': 'Phone Number', 'type': 'string'}, 'books_authored': {'type': 'array', 'items': {'type': 'string'}}, 'email': {'ui:cff:nonModifiable': True, 'format': 'email', 'type': 'string'}}}, 'date_last_modified': '2018-05-20T04:16:30.579101', 'formOptions': {}, 'date_created': '2018-05-20T03:59:32.211390', 'id': 'e211731b-97f4-40ff-8ff6-9658d711d1a0', 'name': 'uischema and schema form -- Academicians Contact Form'}
        self.assertEqual(EXPECTED, body['res'])
        # self.assertIn("value", body['res']['schema'])
        # self.assertIn("value", body['res']['schemaModifier'])
        # self.assertNotIn("schema_versions", body['res'])
        # self.assertNotIn("schemaModifier_versions", body['res'])