"""
pipenv run python -m unittest tests.integration.test_authorize
"""
from .constants import _
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from app import app
from tests.integration.baseTestCase import BaseTestCase


class FormAdmin(BaseTestCase):
    def test_authorize_fail(self):
        response = self.lg.handle_request(
            method="POST",
            path=f"/authorize",
            headers={"Content-Type": "application/json"},
            body=json.dumps({"token": "asdasd"}),
        )
        self.assertEqual(response["statusCode"], 400, response)
