import json
from tests.integration.baseTestCase import BaseTestCase

class TestAddPayment(BaseTestCase):
    def setUp(self):
        super().setUp()
        """Create form."""
        self.formId = self.create_form()
        formOptions = {
            "paymentInfo": {
                "currency": "USD",
                "items": [
                    {
                        "title": "A",
                        "description": "A",
                        "amount": "1",
                        "quantity": "1"
                    }
                ]
            }
        }
        self.edit_form(self.formId, {"schema": {"type": "string"}, "uiSchema": {"title": "Test"}, "formOptions": formOptions })
        responseId, submit_res = self.submit_form(self.formId, "data")

    def test_edit_response_admin_info(self):
        body = {"amount": 1, "currency": "USD", "method": "check", "id": "id1", "date": {"$date": "2019-08-10T00:43:32.291Z"}}
        response = self.lg.handle_request(method='POST',
                                          path=f'/responses/{responseId}/payment',
                                          headers={"authorization": "auth","Content-Type": "application/json"},
                                          body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res']['response']['paid'], True)
        self.assertEqual(body['res']['response']['amount_paid'], 1.0)
        self.assertEqual(body['res']['response']['payment_trail'], expected_data)
        self.assertEqual(len(body['res']['response']['email_trail']), 1)
    def test_edit_response_admin_info_no_send_email(self):
        body = {"sendEmail": False, "amount": 1, "currency": "USD", "method": "check", "id": "id1", "date": {"$date": "2019-08-10T00:43:32.291Z"}}
        response = self.lg.handle_request(method='POST',
                                            path=f'/responses/{responseId}/payment',
                                            headers={"authorization": "auth","Content-Type": "application/json"},
                                            body=json.dumps(body))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res']['response']['paid'], True)
        self.assertEqual(body['res']['response']['amount_paid'], 1.0)
        self.assertEqual(body['res']['response']['payment_trail'], expected_data)
        self.assertEqual(len(body['res']['response']['email_trail']), 0)