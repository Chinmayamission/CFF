"""
python -m unittest tests.integration.test_updateForm
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import _
from app import app
from .form.selfContainedForm import SelfContainedForm

class UpdateForm(SelfContainedForm):
  def test_update_form_name(self):
      """Update form name."""
      NEW_FORM_NAME = "Formy Form Form"
      OLD_FORM_NAME = self.form['name']
      body = {"name": NEW_FORM_NAME}
      response = self.lg.handle_request(method='POST',
                                        path='/forms/{}'.format(self.formId),
                                        headers={"Content-Type": "application/json"},
                                        body=json.dumps(body))
      self.assertEqual(response['statusCode'], 200, response)
      body = json.loads(response['body'])
      self.assertEqual(body['res']['updated_values']['form']['name'], NEW_FORM_NAME)
      # todo: check body here.
      response = self.lg.handle_request(method='GET',
                                        path='/forms/{}/render'.format(self.formId),
                                        headers={},
                                        body='')
      self.assertEqual(response['statusCode'], 200, response)
      body = json.loads(response['body'])
      self.assertEqual(body['res']['name'], NEW_FORM_NAME)
  def test_update_form_schemaModifier(self):
      """Update form name."""
      NEW_SCHEMAMODIFIER_VALUE = {"a":"b"}
      body = {"schemaModifier": dict(self.form["schemaModifier"], **{"value": NEW_SCHEMAMODIFIER_VALUE}) }
      response = self.lg.handle_request(method='POST',
                                        path='/forms/{}'.format(self.formId),
                                        headers={"Content-Type": "application/json"},
                                        body=json.dumps(body))
      self.assertEqual(response['statusCode'], 200, response)
      body = json.loads(response['body'])
      response = self.lg.handle_request(method='GET',
                                        path='/forms/{}/render'.format(self.formId),
                                        headers={},
                                        body='')
      self.assertEqual(response['statusCode'], 200, response)
      body = json.loads(response['body'])
      self.assertEqual(body['res']['schemaModifier']['value'], NEW_SCHEMAMODIFIER_VALUE)