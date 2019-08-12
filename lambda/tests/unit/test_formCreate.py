"""
pipenv run python -m unittest tests.unit.test_formCreate
"""
import unittest
from tests.integration.constants import _
from app import app
from chalicelib.models import Response, User, Form, FormOptions, Org
from chalicelib.routes import form_create
from unittest.mock import MagicMock
from bson.objectid import ObjectId
import datetime
from pymodm.errors import DoesNotExist

def create_org(userId):
    try:
        org = Org.objects.get({})
    except DoesNotExist:
        org = Org(cff_permissions={"a":"B"})
    org.cff_permissions = {userId: {"Orgs_FormsCreate": True} }
    org.save()

class FormCreate(unittest.TestCase):
    def setUp(self):
        app.current_request = MagicMock()
        app.current_request.context = {"authorizer": {"id": "userid"}}
        create_org(app.get_current_user_id())

    def test_form_create_blank(self):
        app.current_request.json_body = {
            "name": "New name",
            "schema": {"new": "schema"},
        }
        response = form_create()
        form = Form.objects.get(
            {"_id": ObjectId(response["res"]["form"]["_id"]["$oid"])}
        )
        self.assertTrue("Untitled" in form.name)
        self.assertEqual(form.cff_permissions, {"userid": {"owner": True}})

    def test_form_create_copy(self):
        form1Id = ObjectId()
        Form(
            name="abc",
            version=1,
            center="None",
            id=form1Id,
            cff_permissions={"old": "cff_permissions"},
            schema={"schema": "custom"},
            uiSchema={"uiSchema": "custom"},
            formOptions=FormOptions(
                confirmationEmailInfo={"a": "B"},
                paymentInfo={"c": "D"},
                paymentMethods={"E": "F"},
                dataOptions={"G": "H"},
                defaultFormData={"I": "J"},
            ),
            date_modified=datetime.datetime.now().isoformat(),
            date_created=datetime.datetime.now().isoformat(),
        ).save()
        app.current_request.json_body = {"formId": form1Id}
        response = form_create()
        form2 = Form.objects.get(
            {"_id": ObjectId(response["res"]["form"]["_id"]["$oid"])}
        )
        form1 = Form.objects.get({"_id": form1Id})
        self.assertEqual(form1.schema, form2.schema)
        self.assertEqual(form1.uiSchema, form2.uiSchema)
        self.assertEqual(form1.formOptions, form2.formOptions)
        self.assertEqual(form2.cff_permissions, {"userid": {"owner": True}})
        self.assertNotEqual(form1.name, form2.name)
        self.assertTrue("Copy" in form2.name)
