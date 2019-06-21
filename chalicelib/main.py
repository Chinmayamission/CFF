import boto3
from chalice import Chalice, AuthResponse, CognitoUserPoolAuthorizer, IAMAuthorizer, UnauthorizedError, BadRequestError
import datetime
import json
import os
import re
import uuid
import logging
from pymodm.errors import DoesNotExist

import pymodm
from chalicelib.util.jwt import get_claims
from chalicelib.models import User
from chalicelib import routes

MODE = os.getenv("MODE", "DEV")
print("MODE IS " + MODE)
USER_POOL_ID = os.getenv("USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
S3_UPLOADS_BUCKET_NAME = os.getenv("S3_UPLOADS_BUCKET_NAME")
# app = None
PROD = True if MODE == "PROD" else False

class CustomChalice(Chalice):
    test_user_id = None
    def get_url(self, path=''):
        if os.getenv("UNIT_TEST") == "TRUE":
            return f"dummy://{path}"
        headers = self.current_request.headers
        stage = self.current_request.context.get('stage', '')
        if stage:
            stage += '/'
        return '%s://%s/%s%s' % (headers.get('x-forwarded-proto', 'http'),
                            headers['host'],
                            stage,
                            path)
    def get_current_user_id(self):
        """Get current user id."""
        id = None
        try:
            id = self.current_request.context['authorizer']['id']
        except (KeyError, AttributeError):
            if app.test_user_id: id = app.test_user_id
        return id
    def get_user_permissions(self, id, model):
        """id = user id. model = model with cff_permissions in it."""
        cff_permissions = getattr(model, "cff_permissions", {})
        current_user_perms = {}
        if id is not "cm:cognitoUserPool:anonymousUser":
            current_user_perms.update(cff_permissions.get("cm:loggedInUser", {}))
        current_user_perms.update(cff_permissions.get(id, {}))
        return current_user_perms
    def check_permissions(self, model, actions):
        if type(actions) is str:
            actions = [actions]
        actions.append("owner")
        id = self.get_current_user_id()
        current_user_perms = self.get_user_permissions(id, model)
        if any((a in current_user_perms and current_user_perms[a] == True) for a in actions):
            return True
        else:
            raise UnauthorizedError("User {} is not authorized to perform action {} on this resource.".format(id, actions))


ssm = boto3.client('ssm', 'us-east-1')
s3_client = boto3.client('s3', "us-east-1")
if MODE == "TEST":
    pymodm.connection.connect("mongodb://localhost:10255/admin")
elif MODE == "DEV":
    pymodm.connection.connect("mongodb://localhost:10255/admin")
elif MODE == "BETA":
    mongo_conn_str = ssm.get_parameter(Name='CFF_COSMOS_CONN_STR_WRITE_BETA', WithDecryption=True)['Parameter']['Value']
    pymodm.connection.connect(mongo_conn_str)
elif MODE == "PROD":
    mongo_conn_str = ssm.get_parameter(Name='CFF_COSMOS_CONN_STR_WRITE_PROD', WithDecryption=True)['Parameter']['Value']
    pymodm.connection.connect(mongo_conn_str)

app = CustomChalice(app_name='ccmt-cff-rest-api')
if MODE != "PROD":
    app.debug = True
    app.log.setLevel(logging.DEBUG)

# This hack allows for integration testing.
test_user_id = os.getenv("DEV_COGNITO_IDENTITY_ID")
if test_user_id:
    app.test_user_id = test_user_id

@app.authorizer()
def iamAuthorizer(auth_request):
    """
    {'sub': 'f31c1cb8-681c-4d3e-9749-d7c074ffd7f6', 'email_verified': True, 'iss': 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_kcpcLxLzn', 'cognito:username': 'f31c1cb8-681c-4d3e-9749-d7c074ffd7f6', 'aud': '77mcm1k9ll2ge68806h5kncfus', 'event_id': '1dc969c8-861e-11e8-b29e-336c6c2ce302', 'token_use': 'id', 'custom:center': 'CCMT', 'auth_time': 1531432454, 'name': 'Ashwin Ramaswami', 'exp': 1532273519, 'iat': 1532269919, 'email': 'success@simulator.amazonses.com'}
    """
    claims = get_claims(auth_request.token)
    if not claims and not app.test_user_id:
        claims = {"sub": "cm:cognitoUserPool:anonymousUser", "name": "Anonymous", "email": "anonymous@chinmayamission.com"}
    else:
        if claims:
            claims["sub"] = "cm:cognitoUserPool:" + claims["sub"]
            id = claims["sub"]
        elif app.test_user_id:
            claims = {"sub": app.test_user_id}
            id = app.test_user_id
        # try:
        #     user = User.objects.get({"_id": id})
        # except DoesNotExist:
        #     print(f"User does not exist. Creating user {id}")
        #     user = User(id=id)
        #     user.save()
        
    return AuthResponse(routes=['*'], principal_id='user', context={
        "id": claims["sub"]
    })

"""
# Home page
http http://localhost:8000/forms/ "Authorization: allow"

# Get form
http http://localhost:8000/forms/e4548443-99da-4340-b825-3f09921b4bc5 "Authorization: allow"

http https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/forms/ "Authorization: allow"
"""

# app.route('/centers', methods=['GET', 'POST'], cors=True, authorizer=iamAuthorizer)(routes.center_list)
# app.route('/centers/{centerId}/forms', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_list)
# app.route('/centers/{centerId}/schemas', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.schema_list)
app.route('/forms', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_list)
app.route('/forms', methods=['POST'], cors=True, authorizer=iamAuthorizer)(routes.form_create)
app.route('/forms/{formId}', methods=['DELETE'], cors=True, authorizer=iamAuthorizer)(routes.form_delete)
app.route('/forms/{formId}', methods=['PATCH'], cors=True, authorizer=iamAuthorizer)(routes.form_edit)
app.route('/forms/{formId}/groups', methods=['PUT'], cors=True, authorizer=iamAuthorizer)(routes.group_edit)
app.route('/forms/{formId}/responses', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_response_list)
# form response edit

# todo use export in client side.
app.route('/forms/{formId}/responsesExport', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_response_export)
app.route('/forms/{formId}/summary', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_response_summary)
# app.route('/responses/{responseId}/checkin', methods=['POST'], cors=True, authorizer=iamAuthorizer)(routes.response_checkin)
app.route('/forms/{formId}/permissions', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_get_permissions)
app.route('/forms/{formId}/permissions', methods=['POST'], cors=True, authorizer=iamAuthorizer)(routes.form_edit_permissions)

app.route('/forms/{formId}', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_render)
app.route('/forms/{formId}/response', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_render_response)
app.route('/forms/{formId}', methods=['POST'], cors=True, authorizer=iamAuthorizer)(routes.form_response_new)
app.route('/responses/{responseId}', methods=['PATCH'], cors=True, authorizer=iamAuthorizer)(routes.response_edit)
app.route('/responses/{responseId}', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.response_view)
app.route('/responses/{responseId}/payment', methods=['POST'], cors=True, authorizer=iamAuthorizer)(routes.response_payment)
app.route('/responses/{responseId}', methods=['DELETE'], cors=True, authorizer=iamAuthorizer)(routes.response_delete)


# Unauthorized:
app.route('/responses/{responseId}/ipn', methods=['POST'], cors=True, content_types=['application/x-www-form-urlencoded'])(routes.response_ipn_listener)
app.route('/responses/{responseId}/ccavenueResponseHandler', methods=['POST'], cors=True, content_types=['application/x-www-form-urlencoded'])(routes.response_ccavenue_response_handler)
app.route('/responses/{responseId}/sendConfirmationEmail', methods=['POST'], cors=True)(routes.response_send_confirmation_email)
app.route('/confirmSignUp', methods=['GET'], cors=True)(routes.confirm_sign_up)

@app.route('/authorize', methods=['POST'], cors=True)
def authorize():
    token = app.current_request.json_body["token"]
    app_client_id = app.current_request.json_body.get("app_client_id", "")
    if app_client_id:
        claims = get_claims(token, verify_audience=True, app_client_id=app_client_id)
    else:
        claims = get_claims(token, verify_audience=True)
    if claims:
        return claims
    else:
        raise BadRequestError(f"Bad request, token not valid. {claims}")