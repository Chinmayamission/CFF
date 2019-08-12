"""
pipenv run python -m unittest tests.unit.test_models
"""
import unittest
from chalice.app import UnauthorizedError
from chalice.config import Config
from chalice.local import LocalGateway
import json

# from ..integration.constants import _
from app import app
import uuid
import os
from chalicelib.models import Form, Response
from bson.objectid import ObjectId


@unittest.skip("too many required fields!")
class FormPermissions(unittest.TestCase):
    def setUp(self):
        pass

    def test_create_form(self):
        oid = ObjectId()
        form = Form(name="form", id=oid)
        form.save()
        self.assertEqual(form.name, "form")
        self.assertEqual(form.id, oid)
        self.assertEqual(form.to_son().to_dict()[
                         "_cls"], "chalicelib.models.Form")

    def test_create_response(self):
        oid = ObjectId()
        response = Response(id=oid, date_created=datetime.datetime.now())
        response.save()
        self.assertEqual(response.id, oid)
        self.assertEqual(
            response.to_son().to_dict()["_cls"], "chalicelib.models.Response"
        )
