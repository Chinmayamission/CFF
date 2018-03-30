from chalice import Chalice, AuthResponse
from chalicelib.models import Form
import json
from chalice import CognitoUserPoolAuthorizer
from boto3 import session
from chalice import IAMAuthorizer
from chalice import UnauthorizedError

# class CustomChalice(Chalice):
#     def __call__(self, event, context):
#         super.__call__(self, event, context)
#         if self.current_request.context.identity.cognitoIdentityId:
#             pass
#         else:
#             http_method = event['requestContext']['httpMethod']
#             return error_response(
#                 error_code='MethodNotAllowedError',
#                 message='Unsupported method: %s' % http_method,
#             http_status_code=405)
#     pass


class CustomChalice(Chalice):
    def check_permissions(self, model, action):
        pass
app = CustomChalice(app_name='ccmt-cff-rest-api')
# app = Chalice(app_name='ccmt-cff-rest-api')
app.debug = True

iamAuthorizer = IAMAuthorizer()


# cognitoAuthorizer = CognitoUserPoolAuthorizer(
#     'ccmt_auth_pool', header='Authorization',
#     provider_arns=['arn:aws:cognito-idp:us-east-1:131049698002:userpool/us-east-1_Whs9pJeeC'])


# @app.authorizer()
# def basic_auth(auth_request):
#     token = auth_request.token
#     # This is just for demo purposes as shown in the API Gateway docs.
#     # Normally you'd call an oauth provider, validate the
#     # jwt token, etc.
#     # In this example, the token is treated as the status for demo
#     # purposes.
#     # if token == 'allow':
#     #     return AuthResponse(routes=[''], principal_id='user')
#     # else:
#     #     # By specifying an empty list of routes,
#     #     # we're saying this user is not authorized
#     #     # for any URLs, which will result in an
#     #     # Unauthorized response.
#     #     return AuthResponse(routes=['/forms', '/blah'], principal_id='user')
#     method_arn = auth_request.method_arn
#     return {
#         "policyDocument": {
#             'Version': '2012-10-17',
#             'Statement': [
#                 {
#                     'Action': 'execute-api:Invoke',
#                     'Effect': 'Allow',
#                     'Resource': [method_arn]
#                 }
#             ]
#         },
#         "principal_id": "user_principal_id",
#         "context": {"a":"b"}
#     }


"""
# Home page
http http://localhost:8000/forms/ "Authorization: allow"

# Get form
http http://localhost:8000/forms/e4548443-99da-4340-b825-3f09921b4bc5 "Authorization: allow"

http https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/forms/ "Authorization: allow"
"""


@app.route('/centers/{centerId}', cors=True, authorizer=iamAuthorizer)
def index(centerId):
    # app.check_permissions('forms', 'ListForms')
    forms = [form.to_dict() for form in Form.ByCenter.query(center=int(centerId))]
    # app.current_request.to_dict()
    return {"res": forms}
    # forms = Form.get(id="e4548443-99da-4340-b825-3f09921b4bc5", version=1).to_dict()
    # return {'current_request': app.current_request.to_dict(), "forms": forms}

@app.route('/forms/{formId}', cors=True, authorizer=iamAuthorizer)
def render_form(formId):
    opts = {
        "ProjectionExpression": "id"
    }
    form = Form.get(id=formId, version=1, dynamo_kwargs=opts).to_dict()
    return {'res': form }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}

# The view function above will return {"hello": "world"}
# whenever you make an HTTP GET request to '/'.
#
# Here are a few more examples:
#
# @app.route('/hello/{name}')
# def hello_name(name):
#    # '/hello/james' -> {"hello": "james"}
#    return {'hello': name}
#
# @app.route('/users', methods=['POST'])
# def create_user():
#     # This is the JSON body the user sent in their POST request.
#     user_as_json = app.current_request.json_body
#     # We'll echo the json body back to the user in a 'user' key.
#     return {'user': user_as_json}
#
# See the README documentation for more examples.
#
