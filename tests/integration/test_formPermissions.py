import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import CENTER_ID, FORM_ID, RESPONSE_ID, EXPECTED_RES_VALUE, COGNITO_IDENTITY_ID, COGNITO_IDENTITY_ID_OWNER, COGNITO_IDENTITY_ID_NO_PERMISSIONS
from app import app
import uuid
import os
"""
python -m unittest tests.integration.test_formPermissions
"""


class FormPermissions(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
        self.orig_id = app.test_user_id
        _, app.test_user_id = COGNITO_IDENTITY_ID_OWNER.split("cff:cognitoIdentityId:")
    def test_list_permissions(self):
        """Load form lists."""
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/permissions'.format(FORM_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        # Do permissions have at least an id and name and email?
        for userId, user in body['res']['userLookup'].items():
          self.assertIn("id", user)
          self.assertIn("name", user)
          self.assertIn("email", user)
          self.assertEqual(userId, user["id"])
        for perm in body['res']['permissions'].values():
          self.assertTrue(type(perm) is dict)
        self.assertTrue(type(body['res']['possiblePermissions']) is list)
    def test_list_permissions_mine(self):
        """List *my* permissions. (not used currently in client side)."""
        response = self.lg.handle_request(method='GET',
                                          path='/forms/{}/permissions?mine=1'.format(FORM_ID),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(list(body['res'].keys()), ["permissions"])
    def test_edit_permissions(self):
        """Edit Permissions."""
        # Add two permissions.
        body = {
          "userId": COGNITO_IDENTITY_ID_NO_PERMISSIONS,
          "permissions": {"Responses_Edit": True, "Responses_View": True}
        }
        response = self.lg.handle_request(method='POST',
                                          path='/forms/{}/permissions'.format(FORM_ID),
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual({"Responses_Edit": True, "Responses_View": True}, body['res'][COGNITO_IDENTITY_ID_NO_PERMISSIONS])
        # Remove permissions.
        body =   {
          "userId": COGNITO_IDENTITY_ID_NO_PERMISSIONS,
          "permissions": {}
        }
        response = self.lg.handle_request(method='POST',
                                          path='/forms/{}/permissions'.format(FORM_ID),
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertTrue(len(body['res']) > 0, "No forms returned!")
        self.assertEqual({}, body['res'].get(COGNITO_IDENTITY_ID_NO_PERMISSIONS, {}))
    def tearDown(self):
      app.test_user_id = self.orig_id