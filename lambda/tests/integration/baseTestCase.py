import unittest
import json
from app import app
from chalice.config import Config
from chalice.local import LocalGateway
from chalicelib.models import Org
from pymodm.errors import DoesNotExist


class BaseTestCase(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(
                app, Config(chalice_stage="dev", config_from_disk=json.load(file))
            )

    def tearDown(self):
        if hasattr(self, "formId"):
            self.delete_form(self.formId)
        Org.objects.delete()

    def create_form(self, should_create_org=True):
        if should_create_org:
            from tests.unit.test_formCreate import create_org

            create_org(app.get_current_user_id())
        response = self.lg.handle_request(
            method="POST", path="/forms", headers={"authorization": "auth"}, body=""
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertIn("form", body["res"])
        self.assertIn("_id", body["res"]["form"])
        self.assertIn("name", body["res"]["form"])
        self.assertEqual(
            {"owner": True}, body["res"]["form"]["cff_permissions"][app.test_user_id]
        )
        self.assertEqual(body["res"]["form"]["version"], 1)
        DEFAULT_SCHEMA = {
            "properties": {"name": {"type": "string"}},
            "title": "Form",
            "type": "object",
        }
        self.assertEqual(body["res"]["form"]["schema"], DEFAULT_SCHEMA)
        formId = body["res"]["form"]["_id"]["$oid"]
        return formId

    def render_form(self, formId, fail=False):
        response = self.lg.handle_request(
            method="GET",
            path=f"/forms/{formId}",
            headers={"authorization": "auth"},
            body="",
        )
        if fail:
            self.assertEqual(response["statusCode"], 404, response)
            return response
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        return body["res"]

    def delete_form(self, formId):
        if not formId:
            return None
        response = self.lg.handle_request(
            method="DELETE",
            path=f"/forms/{formId}",
            headers={"authorization": "auth"},
            body="",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(body.pop("formId"), formId)
        self.assertEqual(body, {"res": None, "success": True, "action": "delete"})
        return body

    def edit_form(self, formId, body):
        response = self.lg.handle_request(
            method="PATCH",
            path=f"/forms/{formId}",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        return body["res"]

    def set_formOptions(self, formOptions):
        self.edit_form(
            self.formId,
            {"schema": {"a": "B"}, "uiSchema": {"a": "B"}, "formOptions": formOptions},
        )

    def submit_form(
        self, formId, formData, responseId=None, submitOptions=None, extra_body={}
    ):
        body = {"data": formData, "responseId": responseId, **extra_body}
        if submitOptions is not None:
            body["submitOptions"] = submitOptions
        response = self.lg.handle_request(
            method="POST",
            path=f"/forms/{formId}",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        responseIdNew = body["res"].pop("responseId", None)
        if responseId:
            # Check that response ids are the same after update.
            self.assertEqual(responseIdNew, responseId)
        return responseIdNew, body["res"]

    def view_response(self, responseId):
        response = self.lg.handle_request(
            method="GET",
            path="/responses/{}".format(responseId),
            headers={"authorization": "auth"},
            body="",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        return body["res"]

    def set_permissions(self, formId, permissions):
        body = {
            "userId": app.get_current_user_id(),
            "permissions": {p: True for p in permissions}
            if len(permissions)
            else {"owner": False},
        }
        response = self.lg.handle_request(
            method="POST",
            path=f"/forms/{formId}/permissions",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        return body["res"]
