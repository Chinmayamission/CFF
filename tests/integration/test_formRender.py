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
        formId = "5b33a0c99eec631ec4e5a710"
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}'.format(formId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(set(("_id", "name", "schema", "uiSchema")), set(body['res'][0].keys()))
        self.assertEqual(body['res']['_id'], formId)