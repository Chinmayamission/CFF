import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from app import app
from .constants import CENTER_ID, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE, COGNITO_IDENTITY_ID, COGNITO_IDENTITY_ID_OWNER, COGNITO_IDENTITY_ID_NO_PERMISSIONS
import uuid
import os

class FormPermissions(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
        self.orig_id = os.getenv("DEV_COGNITO_IDENTITY_ID")
        _, os.environ["DEV_COGNITO_IDENTITY_ID"] = COGNITO_IDENTITY_ID_OWNER.split("cff:cognitoIdentityId:")
    def test_list_permissions(self):
        """Load form lists."""
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/permissions'.format(FORM_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        # Do permissions have at least an id and name and email?
        for permName, permValue in body['res'].items():
          for i in permValue:
            self.assertIn("id", i)
            self.assertIn("name", i)
            self.assertIn("email", i)
    def test_edit_permissions(self):
        """Edit Permissions."""
        # Add two permissions.
        body = {
          "userId": COGNITO_IDENTITY_ID_NO_PERMISSIONS,
          "permissions": ["Responses_Edit", "Responses_View"]
        }
        response = self.lg.handle_request(method='POST',
                                          path='/forms/{}/permissions/edit'.format(FORM_ID),
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertIn(COGNITO_IDENTITY_ID_NO_PERMISSIONS, body['res']['Responses_Edit'])
        self.assertIn(COGNITO_IDENTITY_ID_NO_PERMISSIONS, body['res']['Responses_View'])
        # Remove permissions.
        body =   {
          "userId": COGNITO_IDENTITY_ID_NO_PERMISSIONS,
          "permissions": []
        }
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/permissions/edit'.format(FORM_ID),
                                          headers={},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "No forms returned!")
        if "Responses_Edit" in body['res']:
          self.assertNotIn(COGNITO_IDENTITY_ID_NO_PERMISSIONS, body['res']['Responses_Edit'])
        if "Responses_View" in body['res']:
          self.assertNotIn(COGNITO_IDENTITY_ID_NO_PERMISSIONS, body['res']['Responses_View'])
    def tearDown(self):
      os.environ["DEV_COGNITO_IDENTITY_ID"] = self.orig_id