"""
pipenv run python -m unittest tests.integration.test_formSubmit
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import ONE_SCHEMA, ONE_UISCHEMA, ONE_FORMOPTIONS, ONE_FORMDATA
from app import app
from pydash.objects import set_
from tests.integration.baseTestCase import BaseTestCase
from chalicelib.routes.responseIpnListener import mark_successful_payment
from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId
import time

ONE_SUBMITRES = {'paid': False, 'success': True, 'action': 'insert', 'email_sent': False, 'paymentInfo': {'currency': 'USD', 'items': [{'amount': 0.5, 'description': 'Base Registration', 'name': 'Base Registration', 'quantity': 1.0}], 'total': 0.5}, 'paymentMethods': {'paypal_classic': {'address1': '123', 'address2': 'asdad', 'business': 'aramaswamis-facilitator@gmail.com', 'city': 'Atlanta', 'cmd': '_cart', 'email': 'aramaswamis@gmail.com', 'first_name': 'Ashwin', 'image_url': 'http://www.chinmayanewyork.org/wp-content/uploads/2014/08/banner17_ca1.png', 'last_name': 'Ash', 'payButtonText': 'Pay Now', 'sandbox': False, 'state': 'GA', 'zip': '30022'}}}

class FormSubmit(BaseTestCase):
    maxDiff = None
    def setUp(self):
        super(FormSubmit, self).setUp()
        self.formId = self.create_form()
        self.edit_form(self.formId, {"schema": ONE_SCHEMA, "uiSchema": ONE_UISCHEMA, "formOptions": ONE_FORMOPTIONS})
    def test_submit_form_one(self):
        """Submit form."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)

        """View response."""
        response = self.view_response(responseId)
        self.assertEqual(response['value'], ONE_FORMDATA)

    def test_submit_form_with_update_no_login_required(self):
        """Submit form."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)

        """View response."""
        response = self.view_response(responseId)
        self.assertEqual(response['value'], ONE_FORMDATA)
        self.assertTrue(response.get("user", None) == None)

        
        response = self.lg.handle_request(method='POST',
                                    path=f'/forms/{self.formId}',
                                    headers={"authorization": "auth","Content-Type": "application/json"},
                                    body=json.dumps({"data": ONE_FORMDATA, "responseId": responseId}))
        self.assertEqual(response['statusCode'], 200, response)


    def test_submit_form_with_update(self):
        """Create form."""
        self.formId = self.create_form()
        self.edit_form(self.formId, {"schema": ONE_SCHEMA, "uiSchema": ONE_UISCHEMA, "formOptions": dict(ONE_FORMOPTIONS, loginRequired=True)})

        """Submit form."""
        responseId, submit_res = self.submit_form(self.formId, ONE_FORMDATA)
        self.assertEqual(submit_res, ONE_SUBMITRES, submit_res)
        self.assertIn("paymentMethods", submit_res)

        """View response."""
        response = self.view_response(responseId)
        self.assertEqual(response['value'], ONE_FORMDATA)

        responseIdNew, submit_res = self.submit_form(self.formId, ONE_FORMDATA, responseId)
        self.assertEqual(responseIdNew, responseId)
        self.assertEqual(submit_res, {'paid': False, 'amt_received': {'currency': 'USD', 'total': 0.0}, 'success': True, 'action': 'update', 'email_sent': False, 'paymentInfo': {'currency': 'USD', 'items': [{'amount': 0.5, 'description': 'Base Registration', 'name': 'Base Registration', 'quantity': 1.0}], 'total': 0.5}, 'paymentMethods': {'paypal_classic': {'address1': '123', 'address2': 'asdad', 'business': 'aramaswamis-facilitator@gmail.com', 'city': 'Atlanta', 'cmd': '_cart', 'email': 'aramaswamis@gmail.com', 'first_name': 'Ashwin', 'image_url': 'http://www.chinmayanewyork.org/wp-content/uploads/2014/08/banner17_ca1.png', 'last_name': 'Ash', 'payButtonText': 'Pay Now', 'sandbox': False, 'state': 'GA', 'zip': '30022'}}})
        
        # """Edit response."""
        # body = {"path": "value.contact_name.last", "value": "NEW_LAST!"}
        # response = self.lg.handle_request(method='PATCH',
        #                                   path=f'/responses/{responseId}',
        #                                     headers={"authorization": "auth","Content-Type": "application/json"},
        #                                   body=json.dumps(body))
        # expected_data = dict(ONE_FORMDATA)
        # set_(expected_data, "contact_name.last", "NEW_LAST!")
        # self.assertEqual(response['statusCode'], 200, response)
        # body = json.loads(response['body'])
        # self.assertEqual(body['res']['value'], expected_data)
    
    def test_mark_successful_payment(self):
        responseId, _ = self.submit_form(self.formId, ONE_FORMDATA)
        response = Response.objects.get({"_id": ObjectId(responseId)})
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            response=response,
            full_value={"a":"b","c":"d"},
            method_name="unittest_ipn",
            amount=0.5,
            currency="USD",
            id="payment1"
        )
        response.save()
        self.assertEqual(paid, True)
        response = self.view_response(responseId)
        response['payment_trail'][0].pop("date")
        response['payment_trail'][0].pop("date_created")
        response['payment_trail'][0].pop("date_modified")
        self.assertEqual(response['payment_trail'], [{'value': {'a': 'b', 'c': 'd'}, 'method': 'unittest_ipn', 'status': 'SUCCESS', 'id': 'payment1', '_cls': 'chalicelib.models.PaymentTrailItem'}])
        self.assertEqual(response['paid'], True)
        self.assertEqual(response['amount_paid'], "0.5")

    def test_mark_successful_payment_2(self):
        responseId, _ = self.submit_form(self.formId, ONE_FORMDATA)
        response = Response.objects.get({"_id": ObjectId(responseId)})
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            response=response,
            full_value={"a2":"b2","c2":"d2"},
            method_name="unittest_ipn2",
            amount=0.6,
            currency="USD",
            id="payment2"
        )
        response.save()
        self.assertEqual(paid, True)
        response = self.view_response(responseId)
        response['payment_trail'][0].pop("date")
        response['payment_trail'][0].pop("date_created")
        response['payment_trail'][0].pop("date_modified")
        self.assertEqual(response['payment_trail'], [{'value': {'a2': 'b2', 'c2': 'd2'}, 'method': 'unittest_ipn2', 'status': 'SUCCESS', 'id': 'payment2', '_cls': 'chalicelib.models.PaymentTrailItem'}])
        self.assertEqual(response['paid'], True)
        self.assertEqual(response['amount_paid'], "0.6")

    @unittest.skip("Need to make this test later.")
    def test_mark_successful_payment_not_full(self):
        responseId, _ = self.submit_form(self.formId, ONE_FORMDATA)
        paid = mark_successful_payment(
            form=Form.objects.get({"_id": ObjectId(self.formId)}),
            responseId=responseId,
            full_value={"a":"b","c":"d"},
            method_name="unittest_ipn",
            amount=0.4,
            currency="USD",
            id="payment2"
        )
        # self.assertEqual(paid, False)
        # response = self.view_response(responseId)
        # response['payment_trail'][0].pop("date")
        # self.assertEqual(response['payment_history_full'], [{'value': {'a': 'b', 'c': 'd'}, 'method': 'unittest_ipn', 'status': 'SUCCESS', 'id': 'payment2', '_cls': 'chalicelib.models.PaymentTrailItem'}])
        # self.assertEqual(response['paid'], False)
        # self.assertEqual(response['amount_paid'], "0.4")
        # todo: add more tests for other parts of response.
    # def test_submit_form_ccavenue(self):
    #     formId = "c06e7f16-fcfc-4cb5-9b81-722103834a81"
    #     formData = {"name": "test"}
    #     ccavenue_access_code = "AVOC74EK51CE27COEC"
    #     ccavenue_merchant_id = "155729"
    #     response = self.lg.handle_request(method='POST',
    #                                       path='/forms/{}/responses'.format(formId),
    #                                       headers={"authorization": "auth","Content-Type": "application/json"},
    #                                       body=json.dumps(FORM_DATA_ONE))
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     responseId = body['res'].pop("id")
    #     ccavenue = body['res']["paymentMethods"]["ccavenue"]
    #     self.assertEqual(ccavenue["access_code"], ccavenue_access_code)
    #     self.assertEqual(ccavenue["merchant_id"], ccavenue_merchant_id)
    #     self.assertIn("encRequest", ccavenue)
    #     pass
    # def test_submit_form_manual_approval(self):
    #     # todo.
    #     pass
    # def test_submit_form_v2_manual(self):
    #     """Load form lists."""
    #     form_data = dict(FORM_DATA_ONE, email="success@simulator.amazonses.com")
    #     response = self.lg.handle_request(method='POST',
    #                                       path='/forms/{}/responses'.format(FORM_V2_ID),
    #                                       headers={"authorization": "auth","Content-Type": "application/json"},
    #                                       body=json.dumps(form_data))
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     responseId = body['res'].pop("id")
    #     self.assertEqual(body['res'], FORM_V2_SUBMIT_RESP)
    #     """View response."""
    #     response = self.lg.handle_request(method='GET',
    #                                       path='/forms/{}/responses/{}/view'.format(FORM_V2_ID, responseId),
    #                                       headers={"authorization": "auth",},
    #                                       body='')
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     self.assertEqual(body['res']['value'], form_data['data'])