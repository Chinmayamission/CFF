import boto3
import json
import os
AWS_PROFILE_NAME = "ashwin-cff-lambda"
dev = boto3.session.Session(profile_name=AWS_PROFILE_NAME)
boto3.setup_default_session(profile_name=AWS_PROFILE_NAME)
os.putenv("AWS_PROFILE", AWS_PROFILE_NAME)
os.environ["TABLE_PREFIX"] = "cff_beta"
os.environ["DEV_COGNITO_IDENTITY_ID"] = "us-east-1:1e3aa7b7-b042-4834-98f1-7915985c39a5"

COGNITO_IDENTITY_ID = "cff:cognitoIdentityId:us-east-1:1e3aa7b7-b042-4834-98f1-7915985c39a5"
COGNITO_IDENTITY_ID_NO_PERMISSIONS = "cff:cognitoIdentityId:us-east-1:no-permissions"
COGNITO_IDENTITY_ID_OWNER = "cff:cognitoIdentityId:us-east-1:owner"

CENTER_ID = 1
FORM_ID = "e4548443-99da-4340-b825-3f09921b4df5"
RESPONSE_ID = "d6fee278-158f-4a8d-8e8f-e5f367837166"
EXPECTED_RES_VALUE = json.loads("""{
    "success": true,
    "res": {
        "modifyLink": "http://localhost:8000/index-manualEntry.html",
        "value": {
            "acceptTerms": true,
            "manualEntry": "Cash",
            "contact_name": {
                "last": "test",
                "first": "test"
            },
            "address": {
                "zipcode": "test",
                "state": "test",
                "city": "test",
                "line2": "test",
                "line1": "test"
            },
            "email": "aramaswamis@gmail.com",
            "participants": [
                {
                    "name": {
                        "last": "test",
                        "first": "test"
                    },
                    "gender": "F",
                    "race": "Half Marathon",
                    "age": 40.0
                }
            ]
        },
        "formId": "e4548443-99da-4340-b825-3f09921b4df5",
        "UPDATE_HISTORY": [
            {
                "date": "2018-03-27T18:19:54.608962",
                "action": "pending_update"
            },
            {
                "date": "2018-03-27T18:19:54.652844",
                "action": "updated",
                "UPDATE_VALUE": {
                    "modifyLink": "http://localhost:8000/index-manualEntry.html",
                    "value": {
                        "acceptTerms": true,
                        "manualEntry": "Check",
                        "contact_name": {
                            "last": "test",
                            "first": "test"
                        },
                        "address": {
                            "zipcode": "test",
                            "state": "test",
                            "city": "test",
                            "line2": "test",
                            "line1": "test"
                        },
                        "email": "aramaswamis@gmail.com",
                        "participants": [
                            {
                                "name": {
                                    "last": "test",
                                    "first": "test"
                                },
                                "gender": "F",
                                "race": "Half Marathon",
                                "age": 40.0
                            }
                        ]
                    },
                    "paymentInfo": {
                        "currency": "USD",
                        "total": 25.0,
                        "redirectUrl": "http://omrun.cmsj.org/training-thankyou/",
                        "items": [
                            {
                                "name": "2018 CMSJ OM Run",
                                "description": "Registration for Training Only",
                                "amount": 25.0,
                                "quantity": 1.0
                            }
                        ]
                    }
                }
            },
            {
                "date": "2018-03-27T18:20:05.245130",
                "action": "pending_update"
            },
            {
                "date": "2018-03-27T18:20:05.305086",
                "action": "updated",
                "UPDATE_VALUE": {
                    "modifyLink": "http://localhost:8000/index-manualEntry.html",
                    "value": {
                        "acceptTerms": true,
                        "manualEntry": "Cash",
                        "contact_name": {
                            "last": "test",
                            "first": "test"
                        },
                        "address": {
                            "zipcode": "test",
                            "state": "test",
                            "city": "test",
                            "line2": "test",
                            "line1": "test"
                        },
                        "email": "aramaswamis@gmail.com",
                        "participants": [
                            {
                                "name": {
                                    "last": "test",
                                    "first": "test"
                                },
                                "gender": "F",
                                "race": "Half Marathon",
                                "age": 40.0
                            }
                        ]
                    },
                    "paymentInfo": {
                        "currency": "USD",
                        "total": 25.0,
                        "redirectUrl": "http://omrun.cmsj.org/training-thankyou/",
                        "items": [
                            {
                                "name": "2018 CMSJ OM Run",
                                "description": "Registration for Training Only",
                                "amount": 25.0,
                                "quantity": 1.0
                            }
                        ]
                    }
                }
            }
        ],
        "date_last_modified": "2018-03-27T18:20:05.245141",
        "PAYMENT_HISTORY": [
            {
                "date": "2018-03-27T18:19:12.565977",
                "amount": 25.0,
                "currency": "USD",
                "method": "cff:manualEntry:Check"
            }
        ],
        "responseId": "d6fee278-158f-4a8d-8e8f-e5f367837166",
        "form": {
            "version": "1",
            "id": "e4548443-99da-4340-b825-3f09921b4df5"
        },
        "date_created": "2018-03-27T18:19:12.565905",
        "PAID": true,
        "IPN_TOTAL_AMOUNT": 25.0,
        "paymentInfo": {
            "currency": "USD",
            "total": 25.0,
            "redirectUrl": "http://omrun.cmsj.org/training-thankyou/",
            "items": [
                {
                    "name": "2018 CMSJ OM Run",
                    "description": "Registration for Training Only",
                    "amount": 25.0,
                    "quantity": 1.0
                }
            ]
        }
    }
}
""")

FORM_DATA_ONE = {"modifyLink": "http://omrun.cmsj.org/training-thankyou/", "data": {"acceptTerms": True, "contact_name": {"last": "test", "first": "test"}, "address": {"zipcode": "test", "state": "test", "city": "test", "line2": "test",
                                                                                                                                                                        "line1": "test"}, "email": "aramaswamis@gmail.com", "participants": [{"name": {"last": "test", "first": "test"}, "gender": "M", "race": "5K", "age": 16}]}
                 }
FORM_SUBMIT_RESP_ONE = {'paid': False, 'success': True, 'action': 'insert', 'paymentInfo': {'total': 25.0, 'currency': 'USD', 'redirectUrl': 'http://omrun.cmsj.org/training-thankyou/', 'items': [{'name': '2018 CMSJ OM Run',
                                                                                                                                                                                                    'description': 'Registration for Training Only', 'amount': 25.0, 'quantity': 1.0}]}}
FORM_DATA_TWO = {"modifyLink": "http://omrun.cmsj.org/training-thankyou/", "data": {"acceptTerms": True, "contact_name": {"last": "test", "first": "test"}, "address": {"zipcode": "test", "state": "test", "city": "test", "line2": "test",
                                                                                                                                                                        "line1": "test"}, "email": "aramaswamis@gmail.com", "participants": [{"name": {"last": "test", "first": "test"}, "gender": "M", "race": "5K", "age": 16},
                                                                                                                                                                                                                                             {"name": {"last": "test2", "first": "test2"}, "gender": "M", "race": "5K", "age": 16}]}
                 }
FORM_SUBMIT_RESP_TWO = {'paid': False, 'success': True, 'action': 'insert', 'paymentInfo': {'total': 50.0, 'currency': 'USD', 'redirectUrl': 'http://omrun.cmsj.org/training-thankyou/', 'items': [{'name': '2018 CMSJ OM Run',
                                                                                                                                                                                                    'description': 'Registration for Training Only', 'amount': 25.0, 'quantity': 2.0}]}}
FORM_DATA_TWO_5K_10K = {"modifyLink": "http://omrun.cmsj.org/training-thankyou/", "data": {"acceptTerms": True, "contact_name": {"last": "test", "first": "test"}, "address": {"zipcode": "test", "state": "test", "city": "test", "line2": "test",
                                                                                                                                                                               "line1": "test"}, "email": "aramaswamis@gmail.com", "participants": [{"name": {"last": "test", "first": "test"}, "gender": "M", "race": "5K", "age": 16},
                                                                                                                                                                                                                                                    {"name": {"last": "test2", "first": "test2"}, "gender": "M", "race": "10K", "age": 16}]}
                        }

SCHEMA_ID = "5e258c2c-9b85-40ad-b764-979fc9df1740"
SCHEMA_VERSION = 3
TEST_SCHEMA = {"id": SCHEMA_ID, "version": SCHEMA_VERSION}

FORM_MUTABLE_ID = "52863c95-deb2-43db-8cb8-b77257f2d357"
FORM_MUTABLE_SCHEMA_ID = "5e258c2c-9b85-40ad-b764-979fc9df1740"
FORM_MUTABLE_SCHEMAMODIFIER_ID = "f24bf264-6a5e-4bab-8b6f-6aebc7f5eb33"

_ = None # dummy