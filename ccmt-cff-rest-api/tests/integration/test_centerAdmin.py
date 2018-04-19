import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import CENTER_ID, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE, COGNITO_IDENTITY_ID
from app import app

class FormAdmin(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
    # def test_list_centers_fail(self):
    #     """Load center lists with unauthenticated user (so user setup should happen).
    #     """
    #     body = {
    #         "id": "cff:unitTestId:{}".format(uuid.uuid4()),
    #         "name": "Ashwin",
    #         "email": "a@b.com"
    #     }
    #     response = self.lg.handle_request(method='POST',
    #                                       path='/centers',
    #                                       headers={},
    #                                       body=json.dumps(body))
    #     self.assertEqual(response['statusCode'], 400, response)
    #     body = json.loads(response['body'])
    #     # self.assertTrue(len(body['res']) > 0, "No forms returned!")
    def test_list_centers(self):
        """Load center lists."""
        response = self.lg.handle_request(method='POST',
                                          path='/centers',
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "No forms returned!")
    def test_list_forms(self):
        """Load form lists."""
        response = self.lg.handle_request(method='GET',
                                          path='/centers/{}/forms'.format(CENTER_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "No forms returned!")
        self.assertIn("id", body['res'][0])
        self.assertIn("version", body['res'][0])