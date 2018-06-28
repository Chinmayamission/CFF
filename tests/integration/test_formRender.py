"""
pipenv run python -m unittest tests.integration.test_formRender
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID, FORM_V2_ID, FORM_V2_RENDER_RESP
from app import app
from tests.integration.baseTestCase import BaseTestCase

class FormRender(BaseTestCase):
    def test_render_form(self):
        self.formId = self.create_form()
        response = self.lg.handle_request(method='GET',
                                          path=f'/forms/{self.formId}',
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(set(("_id", "name", "schema", "uiSchema")), set(body['res'].keys()))
        self.assertEqual(body['res']['_id'], self.formId)