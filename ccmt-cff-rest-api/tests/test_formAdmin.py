import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from app import app
from .constants import CENTER_ID, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE

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