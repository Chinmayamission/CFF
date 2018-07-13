"""
pipenv run python -m unittest tests.unit.test_auth
"""
import unittest
from chalice.app import UnauthorizedError
from chalice.config import Config
from chalice.local import LocalGateway
import json
from app import app
import uuid
import os
from collections import namedtuple

def dict_to_object(d):
  return namedtuple('Struct', d.keys())(*d.values())

COG_ID = "asd"
class FormPermissions(unittest.TestCase):
    def setUp(self):
        pass
    def test_get_current_user_id_dev(self):
      app.test_user_id = COG_ID
      self.assertEqual(app.get_current_user_id(), "cm:cognitoUserPool:{}".format(COG_ID))
    def test_get_current_user_id_ctx(self):
      pass
    def test_check_permissions_owner(self):
      app.test_user_id = COG_ID
      model = dict_to_object({"cff_permissions": {app.get_current_user_id(): {"owner": True}}})
      for action in ("owner", "Responses_Edit", "Forms_Edit"):
        with self.subTest(action=action):
          self.assertTrue(app.check_permissions(model, action))
    def test_check_permissions_invalid(self):
      app.test_user_id = COG_ID
      model = dict_to_object({"cff_permissions": {app.get_current_user_id(): {"Responses_View": True}}})
      for action in ("owner", "Responses_Edit", "Forms_Edit"):
        with self.subTest(action=action):
          with self.assertRaises(UnauthorizedError):
            app.check_permissions(model, action)
      self.assertTrue(app.check_permissions(model, "Responses_View"))
    def test_check_permissions_valid(self):
      app.test_user_id = COG_ID
      model = dict_to_object({"cff_permissions": {app.get_current_user_id(): {"Responses_View": True, "Responses_CheckIn": True}}})
      for action in ("Responses_View", ["Responses_View", "Responses_Edit"], ["Form_Edit", "Responses_CheckIn"]):
        with self.subTest(action=action):
          self.assertTrue(app.check_permissions(model, action))
    def test_check_permissions_invalid_false(self):
      app.test_user_id = COG_ID
      model = dict_to_object({"cff_permissions": {app.get_current_user_id(): {"Responses_View": True, "Responses_Edit": False, "Forms_Edit": False, "owner": False}}})
      for action in ("owner", "Responses_Edit", "Forms_Edit"):
        with self.subTest(action=action):
          with self.assertRaises(UnauthorizedError):
            app.check_permissions(model, action)
      self.assertTrue(app.check_permissions(model, "Responses_View"))