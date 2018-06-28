import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import CENTER_ID, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE
from app import app
from tests.integration.baseTestCase import BaseTestCase
@skip()
class FormResponses(BaseTestCase):
    def test_form_responses_list(self):
        """View the entire response list."""
        formId = self.create_form()
        response = self.lg.handle_request(method='GET', headers={}, body='',
                                          path='/forms/{}/responses/'.format(formId))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "Response list is empty.")
        self.delete_form(formId)
    def test_response_summary(self):
        """Test aggregate summary of data."""
        response = self.lg.handle_request(method='GET', headers={}, body='',
                                          path='/forms/{}/summary'.format(FORM_ID))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertIn('unwindTables', body['res'])
        self.assertIn('mainTable', body['res'])
    # def test_view_response(self):
    #     """View response"""
    #     response = self.lg.handle_request(method='GET', headers={}, body='',
    #                                       path='/forms/{}/responses/{}/view'.format(FORM_ID, RESPONSE_ID))
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     self.assertEqual(body, EXPECTED_RES_VALUE)
    # def test_render_form(self):
    #     """Render form."""
    #     response = self.api_get("/forms/{}/render".format(self.FORM_ID))["res"]
    #     self.assertIn("schema", response)
    #     self.assertIn("schemaModifier", response)
    #     self.assertIn("value", response["schema"])
    #     self.assertIn("value", response["schemaModifier"])
    # def test_load_responses(self):
    #     response = self.api_get("/forms/{}/responses".format(self.FORM_ID))
    #     self.assertTrue(len(response['res']) > 0, 'No responses found!')