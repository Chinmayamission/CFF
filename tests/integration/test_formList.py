import unittest
import json
from .constants import CENTER_ID, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE, COGNITO_IDENTITY_ID
from app import app
from tests.integration.baseTestCase import BaseTestCase
"""
pipenv run python -m unittest tests.integration.test_formList
"""

class FormList(BaseTestCase):
    def test_list_forms(self):
        """Load form lists."""
        formId = self.create_form()
        response = self.lg.handle_request(method='GET',
                                          path='/forms',
                                          headers={"authorization": "auth",},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "No forms returned!")
        self.assertEqual(set(("name", "_id", "cff_permissions")), set(body['res'][0].keys()))
        self.delete_form(formId)