import boto3
import json
import os
import json
AWS_PROFILE_NAME = os.getenv("CFF_AWS_PROFILE_NAME", "ashwin-cff-lambda")
dev = boto3.session.Session(profile_name=AWS_PROFILE_NAME)
boto3.setup_default_session(profile_name=AWS_PROFILE_NAME)
os.putenv("AWS_PROFILE", AWS_PROFILE_NAME)
os.environ["TABLE_PREFIX"] = "cff_beta"
os.environ["DEV_COGNITO_IDENTITY_ID"] = "us-east-1:1e3aa7b7-b042-4834-98f1-7915985c39a5"
os.environ["UNIT_TEST"] = "TRUE"

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
FORM_SUBMIT_RESP_ONE = {'paid': False, 'success': True, 'email_sent': False, 'action': 'insert', 'paymentInfo': {'manualEntry': {'enabled': True, 'inputPath': 'manualEntry'}, 'total': 25.0, 'currency': 'USD', 'redirectUrl': 'http://omrun.cmsj.org/training-thankyou/', 'items': [{'name': '2018 CMSJ OM Run',
                                                                                                                                                                                                    'description': 'Registration for Training Only', 'amount': 25.0, 'quantity': 1.0}]}}
FORM_DATA_TWO = {"modifyLink": "http://omrun.cmsj.org/training-thankyou/", "data": {"acceptTerms": True, "contact_name": {"last": "test", "first": "test"}, "address": {"zipcode": "test", "state": "test", "city": "test", "line2": "test",
                                                                                                                                                                        "line1": "test"}, "email": "aramaswamis@gmail.com", "participants": [{"name": {"last": "test", "first": "test"}, "gender": "M", "race": "5K", "age": 16},
                                                                                                                                                                                                                                             {"name": {"last": "test2", "first": "test2"}, "gender": "M", "race": "5K", "age": 16}]}
                 }
FORM_SUBMIT_RESP_TWO = {'paid': False, 'success': True, 'email_sent': True, 'action': 'insert', 'paymentInfo': {'total': 50.0, 'currency': 'USD', 'redirectUrl': 'http://omrun.cmsj.org/training-thankyou/', 'items': [{'name': '2018 CMSJ OM Run',
                                                                                                                                                                                                    'description': 'Registration for Training Only', 'amount': 25.0, 'quantity': 2.0}]}}

FORM_DATA_TWO_5K_10K = {"modifyLink": "http://omrun.cmsj.org/training-thankyou/", "data": {"acceptTerms": True, "contact_name": {"last": "test", "first": "test"}, "address": {"zipcode": "test", "state": "test", "city": "test", "line2": "test",
                                                                                                                                                                               "line1": "test"}, "email": "aramaswamis@gmail.com", "participants": [{"name": {"last": "test", "first": "test"}, "gender": "M", "race": "5K", "age": 16},
                                                                                                                                                                                                                                                    {"name": {"last": "test2", "first": "test2"}, "gender": "M", "race": "10K", "age": 16}]}
                        }
paymentMethods = {'paypal_classic': {'address1': 'test', 'address2': 'test', 'business': 'aramaswamis-facilitator@gmail.com', 'city': 'test', 'cmd': '_cart', 'email': 'aramaswamis@gmail.com', 'first_name': 'test', 'image_url': 'http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png', 'item_name': 'Ashwin', 'item_number': 'Registration for ' 'Training Only', 'last_name': 'test', 'sandbox': True, 'state': 'test', 'zip': '.'}, 'paypal_old_not_used': {'client': {'sandbox': 'AQnuMqn24Q8xTChC8uSgCOnmDjeMXZ1O7ZNS0uCHIsOmcoHqA6g2acYhTa_Qv-euJJ8UVFh4zmhJAWQR'}, 'env': 'sandbox'}}
FORM_SUBMIT_RESP_ONE["paymentMethods"] = paymentMethods
FORM_SUBMIT_RESP_TWO["paymentMethods"] = paymentMethods


SCHEMA_ID = "5e258c2c-9b85-40ad-b764-979fc9df1740"
SCHEMA_VERSION = 3
TEST_SCHEMA = {"id": SCHEMA_ID, "version": SCHEMA_VERSION}

FORM_MUTABLE_ID = "52863c95-deb2-43db-8cb8-b77257f2d357"
FORM_MUTABLE_SCHEMA_ID = "5e258c2c-9b85-40ad-b764-979fc9df1740"
FORM_MUTABLE_SCHEMAMODIFIER_ID = "f24bf264-6a5e-4bab-8b6f-6aebc7f5eb33"

# new type, with schema and sm.
FORM_V2_ID = "e211731b-97f4-40ff-8ff6-9658d711d1a0"
FORM_V2_RENDER_RESP = {'version': 1.0, 'uiSchema': {'phone': {'ui:widget': 'phone', 'ui:placeholder': 'Phone Number'}, 'contact_name': {'last': {'classNames': 'col-12 col-sm-6'}, 'ui:order': ['first', 'last'], 'first': {'classNames': 'col-12 col-sm-6'}}, 'ui:order': ['contact_name', 'email', 'phone', 'area_expertise', 'books_authored', 'papers_authored']}, 'schema': {'description': 'Contact form.', 'title': 'Form with uiSchema and schema inline (Academicians Contact Form)', 'type': 'object', 'definitions': {'name': {'title': ' ', 'type': 'object', 'properties': {'last': {'title': 'Last Name', 'type': 'string', 'classNames': 'twoColumn'}, 'first': {'title': 'First Name', 'type': 'string', 'classNames': 'twoColumn'}}}}, 'properties': {'area_expertise': {'title': 'Area of Expertise', 'type': 'string'}, 'contact_name': {'ui:order': ['first', 'last'], 'title': ' ', 'type': 'object', 'properties': {'last': {'title': 'Last Name', 'type': 'string'}, 'first': {'title': 'First Name', 'type': 'string'}}}, 'papers_authored': {'format': 'textarea', 'title': 'Papers Authored', 'type': 'string'}, 'phone': {'title': 'Phone Number', 'type': 'string'}, 'books_authored': {'format': 'textarea', 'title': 'Books Authored', 'type': 'string'}, 'email': {'format': 'email', 'type': 'string'}}, 'required': ['contact_name', 'email', 'area_expertise']}, 'date_last_modified': '2018-05-20T04:16:30.579101', 'formOptions': {'successMessage': '<h1>Form submission success</h1><h2>Academician Form</h2><p>You will receive an email with confirmation shortly. Thank you!</p>', 'confirmationEmailInfo': {'cc': None, 'template': {'html': '<img src=https://i.imgur.com/a9jf89X.png width=100%><h1>Confirmation</h1><h2>Academician Form</h2>Thank you for  submitting the form. This is a confirmation that we have received your response.<br><br><table>{% for key, value in response.items() %}<tr><th>{{key}}</th><td>{{value}}</td></tr>{% endfor %}</table>'}, 'fromName': 'CCMT Webmaster', 'from': 'webmaster@chinmayamission.com', 'subject': 'Academician Form - We have received your response', 'toField': 'email'}, 'showConfirmationPage': False}, 'date_created': '2018-05-20T03:59:32.211390', 'id': 'e211731b-97f4-40ff-8ff6-9658d711d1a0', 'name': 'uischema and schema form -- Academicians Contact Form'}
# don't use, it may change!
FORM_V2_SUBMIT_RESP = {'paid': True, 'success': True, 'action': 'insert', 'email_sent': True, 'paymentInfo': {'total': 0, 'items': []}, 'paymentMethods': {}}

# Using new.
def load_file(fileName):
    with open(os.path.dirname(os.path.realpath(__file__)) + "/files/" + fileName) as file:
        return json.load(file)

ONE_SCHEMA = load_file("schema.json")
ONE_UISCHEMA = load_file("uiSchema.json")
ONE_FORMOPTIONS = load_file("formOptions.json")
ONE_FORMDATA = load_file("formData.json")


_ = None # dummy