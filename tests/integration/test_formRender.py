"""
pipenv run python -m unittest tests.integration.test_formRender
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID, FORM_V2_ID, FORM_V2_RENDER_RESP
from app import app
from tests.integration.baseTestCase import BaseTestCase
from chalicelib.models import User
import os
from pymodm.errors import DoesNotExist

class FormRender(BaseTestCase):
    def test_render_form(self):
        self.formId = self.create_form()
        response = self.lg.handle_request(method='GET',
                                          path=f'/forms/{self.formId}',
                                          headers={"authorization": "auth",},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(set(("_id", "name", "schema", "uiSchema", "formOptions", "cff_permissions")), set(body['res'].keys()))
        self.assertEqual(body['res']['_id']['$oid'], self.formId)
    def test_render_form_with_response_new_user(self):
        self.userId = os.environ["DEV_COGNITO_IDENTITY_ID"]
        try:
            user = User.objects.get({"id": self.userId})
            user.delete()
        except DoesNotExist:
            pass
        self.test_render_form_with_response()
    def test_render_form_with_response(self):
        formData = {"a":"b"}
        self.formId = self.create_form()
        self.edit_form(self.formId, {"formOptions": dict(loginRequired=True) })
        response = self.lg.handle_request(method='POST',
                                        path=f'/forms/{self.formId}',
                                        headers={"authorization": "auth","Content-Type": "application/json"},
                                        body=json.dumps({"data": formData}))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        
        response = self.lg.handle_request(method='GET',
                                    path=f'/forms/{self.formId}/response',
                                    headers={"authorization": "auth",},
                                    body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])

        self.assertEqual(set(("_id", "paid", "date_created", "date_modified", "form", "user", "amount_paid", "paymentInfo", "value", "modify_link")), set(body['res'].keys()))
        self.assertEqual(body['res']['form']['$oid'], self.formId)
        self.assertEqual(body["res"]['value'], formData)
    def test_render_form_with_predicate_response(self):
        formData = {"grade": "B", "age": 3}
        self.formId = self.create_form()
        predicate = {
            "formId": self.create_form(),
            "patches": [{"type": "walk", "items": ["A","B","C"], "path": "/grade"}]
        }
        self.edit_form(predicate["formId"], {"formOptions": dict(loginRequired=True)})
        self.edit_form(self.formId, {"formOptions": dict(loginRequired=True, predicate=predicate) })
        response = self.lg.handle_request(method='POST',
                                        path=f'/forms/{predicate["formId"]}',
                                        headers={"authorization": "auth","Content-Type": "application/json"},
                                        body=json.dumps({"data": formData}))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])

        response = self.lg.handle_request(method='GET',
                                    path=f'/forms/{self.formId}/response',
                                    headers={"authorization": "auth",},
                                    body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])

        self.assertEqual(body["res"]["value"], {"grade": "C", "age": 3})
        self.delete_form(predicate["formId"])