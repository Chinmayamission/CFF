import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import (
    AWS_REGION,
    CENTER_ID,
    FORM_ID,
    RESPONSE_ID,
    EXPECTED_RES_VALUE,
    DEV_COGNITO_IDENTITY_ID,
    DEV_COGNITO_IDENTITY_ID_SPLIT,
    COGNITO_IDENTITY_ID_NO_PERMISSIONS,
    USER_POOL_ID,
)
from app import app
import uuid
import os
import boto3
import mock
from unittest.mock import MagicMock, PropertyMock
from tests.integration.baseTestCase import BaseTestCase

"""
pipenv run python -m unittest tests.integration.test_formPermissions
"""


class FormPermissions(BaseTestCase):
    def setUp(self):
        super(FormPermissions, self).setUp()
        self.formId = self.create_form()

    @mock.patch("boto3.client")
    def test_list_permissions(self, mock_boto_client):
        cognito_idp_mock = MagicMock()
        mock_boto_client.return_value = cognito_idp_mock
        admin_get_user = PropertyMock(
            return_value={
                "UserAttributes": [
                    {"Name": "name", "value": "unknown"},
                    {"Name": "email", "value": "unknown"},
                ]
            }
        )
        cognito_idp_mock.admin_get_user = admin_get_user

        """Load form permissions."""
        response = self.lg.handle_request(
            method="GET",
            path=f"/forms/{self.formId}/permissions",
            headers={"authorization": "auth"},
            body="",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        # Do permissions have at least an id and name and email?
        for userId, user in body["res"]["userLookup"].items():
            self.assertEqual(user["id"], DEV_COGNITO_IDENTITY_ID)
            self.assertEqual(user["name"], "unknown")
            self.assertEqual(user["email"], "unknown")
            self.assertEqual(userId, user["id"])
        for perm in body["res"]["permissions"].values():
            self.assertTrue(type(perm) is dict)
        self.assertTrue(type(body["res"]["possiblePermissions"]) is list)

        mock_boto_client.assert_called_once_with("cognito-idp", region_name=AWS_REGION)
        admin_get_user.assert_called_once_with(
            UserPoolId=USER_POOL_ID, Username=DEV_COGNITO_IDENTITY_ID_SPLIT
        )

    def test_list_permissions_mine(self):
        """List *my* permissions. (not used currently in client side)."""
        response = self.lg.handle_request(
            method="GET",
            path=f"/forms/{self.formId}/permissions?mine=1",
            headers={"authorization": "auth"},
            body="",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(list(body["res"].keys()), ["permissions"])

    def test_edit_and_delete_permissions(self):
        """Edit Permissions."""
        # Add two permissions.
        body = {
            "userId": COGNITO_IDENTITY_ID_NO_PERMISSIONS,
            "permissions": {"Responses_Edit": True, "Responses_View": True},
        }
        response = self.lg.handle_request(
            method="POST",
            path=f"/forms/{self.formId}/permissions",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(
            {"Responses_Edit": True, "Responses_View": True},
            body["res"]["permissions"][COGNITO_IDENTITY_ID_NO_PERMISSIONS],
        )
        # Remove permissions.
        body = {"userId": COGNITO_IDENTITY_ID_NO_PERMISSIONS, "permissions": {}}
        response = self.lg.handle_request(
            method="POST",
            path=f"/forms/{self.formId}/permissions",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertTrue(len(body["res"]) > 0, "No forms returned!")
        self.assertTrue(COGNITO_IDENTITY_ID_NO_PERMISSIONS not in body["res"])

    def create_user(self, userId, email):
        client = boto3.client("cognito-idp", "us-east-1")
        response = client.admin_create_user(UserPoolId=USER_POOL_ID, Username=email)
        return response["User"]["Username"]

    @unittest.skip("not working")
    def test_edit_and_delete_permissions_with_email(self):
        userId = self.create_user(COGNITO_IDENTITY_ID_NO_PERMISSIONS, "a@b.com")
        """Edit Permissions."""
        # Add two permissions.
        body = {
            "email": "a@b.com",
            "permissions": {"Responses_Edit": True, "Responses_View": True},
        }
        response = self.lg.handle_request(
            method="POST",
            path=f"/forms/{self.formId}/permissions",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(
            {"Responses_Edit": True, "Responses_View": True},
            body["res"]["permissions"][userId],
        )
        # Remove permissions.
        body = {"email": "a@b.com", "permissions": {}}
        response = self.lg.handle_request(
            method="POST",
            path=f"/forms/{self.formId}/permissions",
            headers={"authorization": "auth", "Content-Type": "application/json"},
            body=json.dumps(body),
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertTrue(len(body["res"]) > 0, "No forms returned!")
        self.assertEqual({}, body["res"].get(userId, {}))

    def tearDown(self):
        super(FormPermissions, self).tearDown()
