"""
pipenv run python -m unittest tests.unit.test_formSubmit
"""
from chalicelib.util.formSubmit.emailer import display_form_dict
import unittest
from app import app
from chalicelib.models import Response, User, Form, FormOptions
import uuid
import datetime
import chalicelib.routes

class FormSubmitUtil(unittest.TestCase):
  def test_form_update(self):
    userId = "cm:testId:" + str(uuid.uuid4())
    user = User(id=userId).save()
    paymentInfo = {
      "currency": "USD",
      "items": [
        {"name": "name", "description": "description", "amount": "amountField", "quantity": "1"}
      ]
    }
    form = Form(
      schema={"type": "object", "properties": {"amountField": {"type": "number"}}},
      uiSchema={"title": "Test"},
      formOptions=FormOptions(paymentInfo=paymentInfo),
      date_created=datetime.datetime.now(),
      date_modified=datetime.datetime.now(),
      name="Name",
      cff_permissions={userId: {"owner": True}}
    )
    form.save()
    formId = form.id
    table = display_form_dict({"a":"b"})
    self.assertEqual(table, "<table><tr><th>A</th><td>b</td></tr></table>")