from boto3 import session
from chalice import Chalice, AuthResponse, CognitoUserPoolAuthorizer, IAMAuthorizer, UnauthorizedError
from chalicelib.models import Form, FormSchema, FormSchemaModifier, Response
from chalicelib.aggregate import aggregate_data
import json

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
def form_list(centerId):
    # app.check_permissions('forms', 'ListForms')
    forms = [form.to_dict() for form in Form.ByCenter.query(center=int(centerId))]
    return {"res": forms}
    # forms = Form.get(id="e4548443-99da-4340-b825-3f09921b4bc5", version=1).to_dict()
    # return {'current_request': app.current_request.to_dict(), "forms": forms}

@app.route('/forms/{formId}/render', cors=True, authorizer=iamAuthorizer)
def form_render(formId):
    """Renders schema and schemaModifier. Todo"""
    form = Form.get(id=formId, version=1)
    renderedForm = form.to_dict()
    renderedForm["schema"] = FormSchema.get(**form.schema).to_dict()
    renderedForm["schemaModifier"] = FormSchemaModifier.get(**form.schemaModifier).to_dict()
    return {'res': renderedForm }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}

@app.route('/forms/{formId}/responses', cors=True, authorizer=iamAuthorizer)
def form_response_list(formId):
    """Show all responses for a particular form."""
    responses = [r.to_dict() for r in Response.query(formId=formId)]
    return {'res': responses }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}

@app.route('/forms/{formId}/summary', cors=True, authorizer=iamAuthorizer)
def form_response_summary(formId):
    """Show response agg. summary"""
    form = Form.get(id=formId, version=1)
    dataOptions = FormSchemaModifier.get(**form.schemaModifier).dataOptions
    responses = [r.to_dict() for r in Response.query(formId=formId) if r.PAID == True]
    result = aggregate_data(dataOptions, responses)
    return {"res": result}