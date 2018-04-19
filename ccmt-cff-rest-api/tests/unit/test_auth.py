import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from app import app
import uuid
import os

COG_ID = "asd"
class FormPermissions(unittest.TestCase):
    def setUp(self):
        pass
    def test_get_current_user_id_dev(self):
      app.test_user_id = COG_ID
      self.assertEqual(app.get_current_user_id(), "cff:cognitoIdentityId:{}".format(COG_ID))
    def test_get_current_user_id_ctx(self):
      pass
    # def test_check_permissions_owner(self):
    #   app.test_user_id = COG_ID
    #   print(COG_ID)
    #   model = {"cff_permissions": {app.get_current_user_id(): ["owner"]}}
    #   for action in ("owner", "Responses_Edit", "Form_Edit"):
    #     with self.subTest(action=action):
    #       self.assertTrue(app.check_permissions(model, action))
    # def test_check_permissions_anon(self):
    #   app.test_user_id = COG_ID
    #   print(COG_ID)
    #   model = {"cff_permissions": {app.get_current_user_id(): ["owner"]}}
    #   for action in ("owner", "Responses_Edit", "Form_Edit"):
    #     with self.subTest(action=action):
    #       self.assertTrue(app.check_permissions(model, action))
