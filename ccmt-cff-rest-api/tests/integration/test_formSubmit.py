"""
python -m unittest tests.integration.test_formSubmit
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID, FORM_DATA_ONE, FORM_SUBMIT_RESP_ONE, FORM_DATA_TWO, FORM_SUBMIT_RESP_TWO
from app import app
from pydash.objects import set_

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
        """View response."""
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/responses/{}/view'.format(FORM_ID, responseId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res']['value'], FORM_DATA_ONE['data'])
        
        """Edit response."""
        body = {"path": "value.contact_name.last", "value": "NEW_LAST!"}
        response = self.lg.handle_request(method='POST',
                                          path='/forms/{}/responses/{}/edit'.format(FORM_ID, responseId),
                                            headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        expected_data = dict(FORM_DATA_ONE["data"])
        set_(expected_data, "contact_name.last", "NEW_LAST!")
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res']['value'], expected_data)