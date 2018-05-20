"""
python -m unittest tests.integration.test_ccavenueResponseHandler
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import FORM_ID
from app import app

class TestCcavenueResponseHandler(unittest.TestCase):
    def setUp(self):
        with open(".chalice/config.json") as file:
            self.lg = LocalGateway(app, Config(chalice_stage="beta", config_from_disk=json.load(file)))
    def test_decrypt_duplicate(self):
        # todo: fix this
        pass
        # body = "encResp=06b00c072a530fd9c0291b759eaf1824538eafb8434ddf5263e535922803f6c71f510adf54c24fbc66862c4bc7a271702ea20fa360fb43c6b367a55e3117d7132dc7285af7f45a1a27b1e5bdd69e341d299b5abf72b04bc5e6a78bb4759a6b971e00c9da6de23782f3b2fd9469f78b6a34ce9ee42ac574952775c6f5ac025f1e66ab0c1fa6546731764f29a6dfaf10f357b83e2fc63184875c7eaf3e6ba360e140da2d3971edcc8d193f0172acefa33ed9ad15ed43478f64b70464c7792cc5d70ab0a1d21c197d74749f52658d1006e5b54d692c38b4c5cf859ac407bd3f751295d7b237d5343e39a310cfeaaf7d020bd5350e81b9ef05a759970b5d371573c78eed88ec988d8da1be5a70b4fc71395c81c9c8da246859b24ee03b65c46975bf01f9e1efaacf983f8e3cf281ac6acaef2be0880d223ce42cb3cc69192a583da10c124ef744157ed32aa15e46d046ec86269c6c2878141ad20c3d9605302ac4bf377c3408e8f96c86dd25d03310b9ea4472f79d8dfbf9b8ea3fdaa603ba4d355185d73b7662088f833833ca299627371f056575b6fefabd1930c762120982197827da7acafa6f06bc40d92b88c8ff3bb55f951547e575a4101eec173665e12743728d46f4ce794486c6e3120134d7ca7cac67e6dacc2f76b2308ce15a214e10cc43dacf6528873560096c9e2278c1434b5e1174875c3e36ea87c8ed9c5d0e7c542ebf5f110b8d3527f0451baaf6731f8463fbacf8a6d5795f502c76871c677f006d8fefcb774137b10323358ddea3b5d67279e019c06f4552da2ca942bbb973d1269e28a7fc2f1961a3894adccc0b7efcbb3a04e1303a67e4b28c3cfa9f8c30df87c6f2cd1534e8dcf9f2b333095f17040ad3eb4f93d4d65fc125e435836f5bcdbc3dabdd450ffaf82b4b88487c8fe4f74f623ef9357b0b70cbed2b4464df626560a7aa364cf17917b7f48c860b49329dd217e5a9c1dfe7b340dd1096ce661d3565a9b72663899945a95bae58055ada3eebdfcc35ddebcbeed3de8c5cc6f6e7fcf4fc078f08e526353e06570fe9bccff2125296052b068b97f4defe7d789ccdc6774239f80aca04c25482e15c1a90c05a2d729d144a4a972a2da3483b243501f2e59798438470462586430d95f8b008960a287b2f96239623181db0a68e88732d56ec9a07d704964a68b70c514aeea35d0dca263b27db1ba76aa9b0bd6743053097464fe407d68e0f5d4cdb2aa476acc2c158da55a8c84faf8e03c69d1b8cdc2c6d8f18d0de3fa606b9f4aa17047042bb25d02cc90cc5e83e60d9a8bbf5b85cd6a13a33a6d2a6ec4a1509825ed9e135e5cb07410273623ebccc7a00e0693fa0a8dcb8d1eade38fe780dc7e816a950ef488336b353cc6a168b058fe127a71e00dd&orderNo=M63jRqXV2ejjzsgqGrcr3h"
        # formId = "c06e7f16-fcfc-4cb5-9b81-722103834a81"
        # responseId = "bce35d38-e83a-4514-bdc1-b4c22fa8e30d"
        # response = self.lg.handle_request(method='POST',
        #                                   path=f"/forms/{formId}/responses/{responseId}/ccavenueResponseHandler",
        #                                   headers={"Content-Type": "application/x-www-form-urlencoded"},
        #                                   body=body)
        # self.assertEqual(response['statusCode'], 500, response)
        # print(response)
        # todo: should this be 4xx instead?
    def test_decrypt_success(self):
        # asd
        pass