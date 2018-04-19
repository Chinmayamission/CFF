"""
python -m unittest tests.integration.test_formSubmit
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID, FORM_DATA_ONE, FORM_SUBMIT_RESP_ONE, FORM_DATA_TWO, FORM_SUBMIT_RESP_TWO
from app import app

class FormSubmit(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
    def test_submit_form_one(self):
        """Load form lists."""
        response = self.lg.handle_request(method='POST',
                                          path='/forms/{}/responses'.format(FORM_ID),
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps(FORM_DATA_ONE))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        responseId = body['res'].pop("id")
        self.assertEqual(body['res'], FORM_SUBMIT_RESP_ONE)