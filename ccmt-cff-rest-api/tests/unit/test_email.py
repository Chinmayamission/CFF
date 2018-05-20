"""
python -m unittest tests.unit.test_email
"""
from chalicelib.util.formSubmit.emailer import create_confirmation_email_dict
# import tests.config
from tests.integration.constants import _
import unittest
from botocore.exceptions import ClientError
CONFIRMATION_EMAIL_INFO = {
    "cc": None,
    "image": "http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png",
    "showResponse": True,
    "modifyLink": "onions",
    "showModifyLink": True,
    "subject": "CFF Unit Testing Form\n Confirmation",
    "toField": "email",
    "fromName": "Test",
    "from": "ccmt.dev@gmail.com",
    "message": "Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018."
}

CONFIRMATION_EMAIL_INFO_TEMPLATE = {
    "template": {"html": "<h1>Action Needed:</h1><h2>2018 Jagadeeshwara Mandir Suvarna Mahotsava Yajman Sponsorship Form</h2>Thank you for registration. As per Government of India FCRA guideliness CCMT is required to keep proof of Identity of the donor and hence we request you to send a copy of your passport to CCMT CFO abc.def@chinmayamission.com, copied on this email.<br> <table>{% for key, val in value.items() %}<tr><th>{{key}}</th><td>{{val}}</td></tr>{% endfor %}</table><br> <table><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr> <tr>{% for item in paymentInfo.values() %}<td>{{item.name}}</td><td>{{item.description}}</td><td>{{item.quantity}}</td>{{item.amount}}{% endfor %}</table>"},
    "subject": "CFF Unit Testing Form\n Confirmation",
    "toField": "email",
    "fromName": "Test",
    "from": "ccmt.dev@gmail.com"
}

TO_EMAIL = "success@simulator.amazonses.com"

RESPONSE = {
    "value": {"email": TO_EMAIL},
    "paymentInfo": {
      "currency": "USD",
      "total": 500,
      "redirectUrl": "onions",
      "items": [
        {
          "name": "name",
          "description": "description",
          "quantity": 1,
          "amount": 12.00
        }
      ]
    }
}

EXPECTED_RES = {
    'toEmail': ['success@simulator.amazonses.com'],
    'fromEmail': 'ccmt.dev@gmail.com',
    'fromName': 'Test',
    'subject': 'CFF Unit Testing Form\n Confirmation',
    'bccEmail': '',
    'ccEmail': None,
    'addCSS': True,
    'msgBody': "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"
}

EXPECTED_RES_TEMPLATE = {
    'toEmail': ['success@simulator.amazonses.com'],
    'fromEmail': 'ccmt.dev@gmail.com',
    'fromName': 'Test',
    'subject': 'CFF Unit Testing Form\n Confirmation',
    'bccEmail': '',
    'ccEmail': '',
    'addCSS': False,
    "msgBody": "<h1>Action Needed:</h1><h2>2018 Jagadeeshwara Mandir Suvarna Mahotsava Yajman Sponsorship Form</h2>Thank you for registration. As per Government of India FCRA guideliness CCMT is required to keep proof of Identity of the donor and hence we request you to send a copy of your passport to CCMT CFO abc.def@chinmayamission.com, copied on this email.<br> <table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br> <table><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr> <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></table>"
}

class TestCreateEmail(unittest.TestCase):
    maxDiff = None
    def test_create_email_paymentInfo_undefined(self):
        pass
        # send_confirmation_email({"value": {"email": TO_EMAIL}}, CONFIRMATION_EMAIL_INFO)

    def test_create_email_success(self):
        res = create_confirmation_email_dict(RESPONSE, CONFIRMATION_EMAIL_INFO)
        self.assertEqual(res, EXPECTED_RES)
    
    def test_create_email_multiple_one_email_not_found(self):
        """ One email will be None -- it should not include this email here."""
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO, **{"toField": ["email", "email2"]})
        res = create_confirmation_email_dict(RESPONSE, confirmationEmailInfo)
        self.assertEqual(res, dict(EXPECTED_RES, **{"toEmail": [TO_EMAIL, None]}))

    def test_create_email_multiple_to(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO, **{"toField": ["email", "email2"]})
        response = dict(RESPONSE)
        response["value"] = {"email": TO_EMAIL, "email2": TO_EMAIL}
        res = create_confirmation_email_dict(response, confirmationEmailInfo)
        self.assertEqual(res, dict(EXPECTED_RES, **{"toEmail": [TO_EMAIL, TO_EMAIL], "msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr><tr><th>email2</th><td>success@simulator.amazonses.com</td></tr></table><br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"}))

    def test_create_email_custom_total_amount_text(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO, **{"totalAmountText": "CUSTOMCUSTOM"})
        res = create_confirmation_email_dict(RESPONSE, confirmationEmailInfo)
        self.assertEqual(res, dict(EXPECTED_RES, **{"msgBody": EXPECTED_RES["msgBody"].replace("Total Amount", "CUSTOMCUSTOM")}))    

    def test_create_email_show_response_false(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO, **{"showResponse": False})
        res = create_confirmation_email_dict(RESPONSE, confirmationEmailInfo)
        self.assertEqual(res, dict(EXPECTED_RES, **{"msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"}))    

    def test_create_email_table_column_order(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO, **{"responseTableOptions": {"columnOrder": ["email"]}})
        response = dict(RESPONSE, **{"value": {"email": TO_EMAIL, "email2": TO_EMAIL}})
        res = create_confirmation_email_dict(response, confirmationEmailInfo)
        self.assertEqual(res, dict(EXPECTED_RES, **{"msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"}))

    def test_create_email_table_column_order_complex(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO, **{"responseTableOptions": {"columnOrder": ["participants.0.name.first", "participants", "email"]}})
        response = dict(RESPONSE, **{"value": {"participants": [{"name": {"first": "Ashwin"}, "age": 12}], "email": TO_EMAIL, "email2": TO_EMAIL}})
        res = create_confirmation_email_dict(response, confirmationEmailInfo)
        self.assertEqual(res, dict(EXPECTED_RES, **{"msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table><tr><th>participant 1 name: first</th><td>Ashwin</td></tr><tr><th>participant 1 age</th><td>12</td></tr><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"}))
    
    def test_create_email_html_template(self):
        res = create_confirmation_email_dict(RESPONSE, CONFIRMATION_EMAIL_INFO_TEMPLATE)
        self.assertEqual(res, EXPECTED_RES_TEMPLATE)
