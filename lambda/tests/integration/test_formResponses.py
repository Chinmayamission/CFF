"""
pipenv run python -m unittest tests.integration.test_formResponses
"""
import hashlib
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import ONE_FORMDATA
from app import app
from tests.integration.baseTestCase import BaseTestCase
from chalicelib.models import Response, Form
from bson.objectid import ObjectId
from unittest.mock import MagicMock


class FormResponses(BaseTestCase):
    def setUp(self):
        super(FormResponses, self).setUp()
        self.formId = self.create_form()
        form = Form.objects.get({"_id": ObjectId(self.formId)})
        to_create = [Response(form=form, paid=True) for i in range(0, 50)]
        Response.objects.bulk_create(to_create)

    def test_form_responses_list(self):
        """View the entire response list."""
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{self.formId}/responses/",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertTrue(len(body["res"]) > 0, "Response list is empty.")

    def test_form_responses_list_anon_failed(self):
        formId = self.create_form()
        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                # "formOptions": {"a": "b"},
            },
        )
        self.set_permissions(formId, [])
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/",
        )
        self.assertEqual(response["statusCode"], 401, response)

    def test_form_responses_list_anon_with_responseListApiKey_pass(self):
        formId = self.create_form()
        apiKey = "abcdefg"

        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions": {
                    "responseListApiKey": hashlib.sha512(apiKey.encode()).hexdigest()
                },
            },
        )
        self.set_permissions(formId, [])
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/",
        )
        self.assertEqual(response["statusCode"], 401, response)
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/?apiKey=bcd",
        )
        self.assertEqual(response["statusCode"], 401, response)
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/?apiKey=abcdefg",
        )
        self.assertEqual(response["statusCode"], 200, response)

    def test_form_responses_search(self):
        """Search the response list."""
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{self.formId}/responses/?query=test",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertTrue(len(body["res"]) > 0, "Response list is empty.")
        self.assertEqual(list(body["res"][0].keys()), ["_id"])

    def test_response_stats_aggregate_count(self):
        self.set_formOptions(
            {
                "dataOptions": {
                    "views": [
                        {
                            "id": "aggregateView",
                            "type": "stats",
                            "stats": [
                                {
                                    "type": "single",
                                    "title": "a",
                                    "queryType": "aggregate",
                                    "queryValue": [
                                        {
                                            "$match": {
                                                "value.registrationType": "sponsorship"
                                            }
                                        },
                                        {"$group": {"_id": None, "n": {"$sum": 1}}},
                                    ],
                                }
                            ],
                        }
                    ]
                }
            }
        )
        self.submit_form(self.formId, {"registrationType": "sponsorship"})
        self.submit_form(self.formId, {"registrationType": "sponsorship"})
        self.submit_form(self.formId, {"registrationType": "standard"})
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{self.formId}/responses/?dataOptionView=aggregateView",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(
            body["res"],
            {
                "stats": [
                    {
                        "type": "single",
                        "title": "a",
                        "queryType": "aggregate",
                        "queryValue": [
                            {"$match": {"value.registrationType": "sponsorship"}},
                            {"$group": {"_id": None, "n": {"$sum": 1}}},
                        ],
                        "computedQueryValue": 2,
                    }
                ]
            },
        )

    def test_response_stats_aggregate_sum(self):
        self.set_formOptions(
            {
                "dataOptions": {
                    "views": [
                        {
                            "id": "aggregateView",
                            "type": "stats",
                            "stats": [
                                {
                                    "type": "single",
                                    "title": "a",
                                    "queryType": "aggregate",
                                    "queryValue": [
                                        {
                                            "$group": {
                                                "_id": None,
                                                "n": {"$sum": "$value.age"},
                                            }
                                        }
                                    ],
                                }
                            ],
                        }
                    ]
                }
            }
        )
        self.submit_form(self.formId, {"age": 4})
        self.submit_form(self.formId, {"age": 2})
        self.submit_form(self.formId, {"age": 4})
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{self.formId}/responses/?dataOptionView=aggregateView",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        self.assertEqual(
            body["res"],
            {
                "stats": [
                    {
                        "type": "single",
                        "title": "a",
                        "queryType": "aggregate",
                        "queryValue": [
                            {"$group": {"_id": None, "n": {"$sum": "$value.age"}}}
                        ],
                        "computedQueryValue": 10,
                    }
                ]
            },
        )

    def test_response_stats_aggregate_group(self):
        self.formId = self.create_form()
        self.set_formOptions(
            {
                "dataOptions": {
                    "views": [
                        {
                            "id": "aggregateView",
                            "type": "stats",
                            "stats": [
                                {
                                    "type": "group",
                                    "title": "a",
                                    "queryType": "aggregate",
                                    "queryValue": [
                                        {
                                            "$group": {
                                                "_id": "$value.city",
                                                "n": {"$sum": 1},
                                            }
                                        }
                                    ],
                                }
                            ],
                        }
                    ]
                }
            }
        )
        self.submit_form(self.formId, {"city": "San Jose"})
        self.submit_form(self.formId, {"city": "San Ramon"})
        self.submit_form(self.formId, {"city": "San Ramon"})
        self.submit_form(self.formId, {"city": "San Francisco"})
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{self.formId}/responses/?dataOptionView=aggregateView",
        )
        self.assertEqual(response["statusCode"], 200, response)
        body = json.loads(response["body"])
        # self.assertEqual(
        #     body["res"],
        #     {
        #         "stats": [
        #             {
        #                 "type": "group",
        #                 "title": "a",
        #                 "queryType": "aggregate",
        #                 "queryValue": [
        #                     {"$group": {"_id": "$value.city", "n": {"$sum": 1}}}
        #                 ],
        #                 "computedQueryValue": [
        #                     {"_id": "San Francisco", "n": 1},
        #                     {"_id": "San Ramon", "n": 2},
        #                     {"_id": "San Jose", "n": 1},
        #                 ],
        #             }
        #         ]
        #     },
        # )
        # self.assertTrue("computedQueryValue" in body["res"]["stats"])

    def test_form_responses_stat_anon_with_apiKey_pass(self):
        formId = self.create_form()
        apiKey = "abcdefg"

        self.edit_form(
            formId,
            {
                "schema": {"a": "B"},
                "uiSchema": {"a": "B"},
                "formOptions":             {
                "dataOptions": {
                    "views": [
                        {
                            "id": "aggregateView",
                            "type": "stats",
                            "apiKey": hashlib.sha512(apiKey.encode()).hexdigest(),
                            "stats": [
                                {
                                    "type": "single",
                                    "title": "a",
                                    "queryType": "aggregate",
                                    "queryValue": [
                                        {
                                            "$match": {
                                                "value.registrationType": "sponsorship"
                                            }
                                        },
                                        {"$group": {"_id": None, "n": {"$sum": 1}}},
                                    ],
                                }
                            ],
                        }
                    ]
                }
            }
            },
        )
        self.submit_form(formId, {"registrationType": "sponsorship"})
        self.submit_form(formId, {"registrationType": "sponsorship"})
        self.submit_form(formId, {"registrationType": "standard"})
        self.set_permissions(formId, [])
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/",
        )
        self.assertEqual(response["statusCode"], 401, response)
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/?apiKey=bcd",
        )
        self.assertEqual(response["statusCode"], 401, response)
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/?apiKey=abcdefg",
        )
        self.assertEqual(response["statusCode"], 401, response)
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/?dataOptionView=aggregateView",
        )
        self.assertEqual(response["statusCode"], 401, response)
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/?apiKey=bcd&dataOptionView=aggregateView",
        )
        self.assertEqual(response["statusCode"], 401, response)
        response = self.lg.handle_request(
            method="GET",
            headers={"authorization": "auth"},
            body="",
            path=f"/forms/{formId}/responses/?apiKey=abcdefg&dataOptionView=aggregateView",
        )
        self.assertEqual(response["statusCode"], 200, response)