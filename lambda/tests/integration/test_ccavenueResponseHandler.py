"""
python -m unittest tests.integration.test_ccavenueResponseHandler
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID, ONE_SCHEMA, ONE_UISCHEMA, ONE_FORMOPTIONS
from app import app
from tests.integration.baseTestCase import BaseTestCase
from chalicelib.models import Response, PaymentStatusDetailItem
import datetime
from bson.objectid import ObjectId


class TestCcavenueResponseHandler(BaseTestCase):
    def setUp(self):
        super(TestCcavenueResponseHandler, self).setUp()
        self.formId = self.create_form()
        self.edit_form(
            self.formId,
            {
                "schema": ONE_SCHEMA,
                "uiSchema": ONE_UISCHEMA,
                "formOptions": dict(ONE_FORMOPTIONS, paymentMethods={"ccavenue": {"merchant_id": "mid123" } })
            },
        )

    @unittest.skip(
        "Need to refactor this in order to create the particular response already."
    )
    def test_decrypt_duplicate(self):
        body = "encResp=85c72f4fb76196a0654cf01097e987e5ec6e8c5f8d81a6b25c9cb4bddec531956f96327d231b51d4be7896c10d0120f2dba70077d0d3ccaff5594a5c1177adcaf6f96b2b35bbd6b4c4dc0f205789cc0cf233d1eb2cce1f4b1ef05cd6e16f7b2c1c79408f369bcf69742c61d044bfbb5aaa2c45c68c5f2441255bee6ac9cc6a525f9fda8d22e1a6dbfdc5ddcb7848634ab635d354ae3bfff8ded552c64b214e8b556d54ea4b6900dfd14dda359ae65ab5e95784bb6d570f4afc279c1909df44def176a330de7cf3611e23183bb39b85c76b5f36f9c3cd8daf065033c5866b9d42f356379463b514ba69cf57e1b4c19a54ddecf5a158fb4fc919d286d42819e69eea6fdef36543400d45c901cdbf22f55703c046cd128c9279bce5be97ae5d0e21728dc24f378802d03b54185170b0b084ef006945849c0775bd24643584e99ef55f9260fc3ac2373e54d03b1f6196dde6e9e4fc46cb151368e15d66de3d0db077492cec878bec59ca77ab878196198b71d226da8e8606b1e27921b52b85da4360be4dd607a25bfa13538c4c6b7289609d52382851330e51b6a004eda7c8d9dff61212aa00b7027771ccf3858367c03b8aba69fbfbfb4b10170e4d3a9c57ea2206d8515f27e0b3f667a5e2932cda48f1c229865814ddf5c26563b73e00a216f709cbc50190090acde0458d37c0c074e5344e5a0498cec58f9984663aaba0d4c3f556ddf4ffc2ff4d93f48d811e521c097e9ac1acc7e9e5811144743c8620fafd51ce26c490efc639b299c5e693f70c52fe6b8632ed7ca20652dbdd91147ee10c13b00a0b69bef6241fe39ef6d0ed7889bb96c293742ce1b742e7e5579ca2a33544a5eaea7f5e3e15b0ce1e43d55d1ef88befd57ee8deeee9d4e6f4b308b05405d58c98f5f2ea693247345eebf2a7343a4b2983460d48443bfada82b5ae208c07a79b08dffdfe769e24fc8e7778bec5e986066bca693dd6786a684c6bafbdfa24f12e51faf682bfc0b0a32cc38e0f5d5ce466ab6bf299d2a92454b4b2c33857d7deda1c583330aad3b60e367e044454a6d5e56aac71aa3a0b7cc7b37ca255bd3e666332691957272b6b6ee2efe6087b5ab16e2baa760c9cf9b5f8bf14a52fa02d952bd1cbb99489cc0496d10f537ccd9bef78a44398a937213023106a414bc8896c8b8a4bbfa28db1fa700a5a2550afa8c01cbe738cae0c260eda3340de36314fdff44af9a164a4595a5e0255d734205cf87836469f186eb8661d006e94bb5cd5f0d3234d5569261cb82de4a528aa09d60eb8f6ee1fd1e387d836b3876b0c343cb35fe55245fb6eed3501c343e3b608350d&orderNo=5cdb487f5a098b41cbd4ab70&crossSellUrl=https%3A%2F%2Fwww.cricbuzz.com"
        responseId = "5cdb3deb5a098b2f1ed11629"
        # todo: set up form to work properly with this. response must already have had the ccavenue response handler done before.
        response = self.lg.handle_request(
            method="POST",
            path=f"/responses/{responseId}/ccavenueResponseHandler",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            body=body,
        )
        self.assertEqual(response["statusCode"], 500, response)
        self.assertIn("IPN ERROR: Duplicate IPN transaction ID", response["body"])
        # todo: should this be 4xx instead?

    def test_decrypt_success(self):
        # asd
        pass

    def make_request(self, responseId, body, fail=False):
        response = self.lg.handle_request(
            method="POST",
            path=f"/responses/{responseId}/ccavenueResponseHandler",
            headers={
                "authorization": "auth",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body=body,
        )
        if fail:
            self.assertEqual(response["statusCode"], 500)
        else:
            self.assertEqual(response["statusCode"], 200)
        return response["body"]

    def test_invalid_merchant_id(self):
        responseId = str(ObjectId())
        response = Response(
            id=ObjectId(responseId),
            form=self.formId,
            date_modified=datetime.datetime.now(),
            date_created=datetime.datetime.now(),
            value={"a": "b", "email": "success@simulator.amazonses.com"},
            paymentInfo={
                "total": 0.5,
                "currency": "USD",
                "items": [
                    {"name": "a", "description": "b", "amount": 0.25, "quantity": 1},
                    {"name": "a2", "description": "b2", "amount": 0.25, "quantity": 1},
                ],
            },
        ).save()
        self.make_request(responseId, "")

        response = self.view_response(responseId)

        detail_payment_one = response["payment_status_detail"][0]
        detail_payment_one.pop("date")
        detail_payment_one.pop("date_created")
        detail_payment_one.pop("date_modified")
        self.assertEqual(detail_payment_one["status"], "ERROR")
        self.assertEqual(detail_payment_one["id"], "CCAvenue config not found for merchant id: mid123")
    
