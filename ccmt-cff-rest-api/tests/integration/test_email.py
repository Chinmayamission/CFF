"""
python -m unittest tests.integration.test_email
"""
from chalicelib.util.formSubmit.emailer import send_confirmation_email
from chalicelib.routes.responseSendConfirmationEmail import response_send_confirmation_email
# import tests.config
from tests.integration.constants import _
from tests.unit.test_email import CONFIRMATION_EMAIL_INFO, CONFIRMATION_EMAIL_INFO_TEMPLATE, RESPONSE
import unittest
import json
from botocore.exceptions import ClientError
from chalice.config import Config
from chalice.local import LocalGateway
from app import app

class TestEmail(unittest.TestCase):
    maxDiff = None
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
    def test_actually_send_email_cc_bad_email(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO, **{"cc": "bad_email"})
        with self.assertRaises(ClientError):
            send_confirmation_email(RESPONSE, confirmationEmailInfo)
    def test_actually_send_email(self):
        send_confirmation_email(RESPONSE, CONFIRMATION_EMAIL_INFO)
    def test_actually_send_email_template(self):
        send_confirmation_email(RESPONSE, CONFIRMATION_EMAIL_INFO_TEMPLATE)
    def test_endpoint_send_confirmation_email_success(self):
        formId = "3da8dc83-3e6e-4900-a99b-ac45dcae2fbb"
        responseId = "6949b63c-ec89-4e79-b33d-378f1c1d2f42"
        response = self.lg.handle_request(method='POST',
                                          path=f'/forms/{formId}/responses/{responseId}/sendConfirmationEmail',
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps({"paymentMethod": "manual_approval"}))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body, {'success': True, 'email_sent': True, 'email': {'toEmail': ['success@simulator.amazonses.com'], 'fromEmail': 'ccmt.dev@gmail.com', 'fromName': 'CCMT', 'subject': 'Action Needed - 2018 Jagadeeshwara Mandir Suvarna Mahotsava Yajman Sponsorship Form', 'bccEmail': '', 'ccEmail': '', 'msgBody': '<h1>Action Needed:</h1><h2>2018 Jagadeeshwara Mandir Suvarna Mahotsava Yajman Sponsorship Form</h2>Thank you for registration. As per Government of India FCRA guideliness CCMT is required to keep  proof of Identity of the donor and hence we request you to send a copy of your passport to CCMT CFO a.b@chinmayamission.com, copied on this email.<br><table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br><table><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>123</td><td>456</td><td>1</td><td>1</td></table>'}})
        # todo: add more stuff.