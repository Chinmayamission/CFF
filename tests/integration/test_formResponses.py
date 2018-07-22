"""
pipenv run python -m unittest tests.integration.test_formResponses
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import ONE_FORMDATA
from app import app
from tests.integration.baseTestCase import BaseTestCase
from chalicelib.models import Response, Form
from bson.objectid import ObjectId

class FormResponses(BaseTestCase):
    def setUp(self):
        super(FormResponses, self).setUp()
        self.formId = self.create_form()
        form = Form.objects.get({"_id": ObjectId(self.formId)})
        to_create = [Response(form=form) for i in range(0,50)]
        Response.objects.bulk_create(to_create)
        print("bulk create done")
    def test_form_responses_list(self):
        """View the entire response list."""
        response = self.lg.handle_request(method='GET', headers={"authorization": "auth",}, body='',
                                          path=f'/forms/{self.formId}/responses/')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "Response list is empty.")
    def test_response_summary(self):
        """View aggregate summary of data."""
        response = self.lg.handle_request(method='GET', headers={"authorization": "auth",}, body='',
                                          path=f'/forms/{self.formId}/summary')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        # self.assertIn('unwindTables', body['res'])
        # self.assertIn('mainTable', body['res'])