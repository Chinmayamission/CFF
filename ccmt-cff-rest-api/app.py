from boto3 import session
from chalice import Chalice, AuthResponse, CognitoUserPoolAuthorizer, IAMAuthorizer, UnauthorizedError
from chalicelib.models import Form, FormSchema, FormSchemaModifier, Response, User
from chalicelib.aggregate import aggregate_data
import json

class CustomChalice(Chalice):
    def get_current_user_id(self):
        return "cff:cognitoIdentityId:{}".format(self.current_request.context.identity.cognitoIdentityId)
    def check_permissions(self, model, action):
        id = self.get_current_user_id()
        cff_permissions = getattr(model, "cff_permissions", {})
        if id in getattr(cff_permissions, action, []) or id in getattr(cff_permissions, "owner", []):
            return True
        else:
            raise UnauthorizedError("User {} is not authorized to perform action {}".format(id, action))

app = CustomChalice(app_name='ccmt-cff-rest-api')
# app = Chalice(app_name='ccmt-cff-rest-api')
app.debug = True

iamAuthorizer = IAMAuthorizer()

"""
# Home page
http http://localhost:8000/forms/ "Authorization: allow"

# Get form
http http://localhost:8000/forms/e4548443-99da-4340-b825-3f09921b4bc5 "Authorization: allow"

http https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/forms/ "Authorization: allow"
"""

@app.route('/centers', cors=True, authorizer=iamAuthorizer)
def form_list(centerId):
    user = User.get(id=app.get_current_user_id())
    centers = Center.get_batch(keys=({"id": id for i in user.centers}))
    return {"res": [c.to_dict() for c in centers]}

@app.route('/centers/{centerId}/forms', cors=True, authorizer=iamAuthorizer)
def form_list(centerId):
    # app.check_permissions('forms', 'ListForms')
    forms = [form.to_dict() for form in Form.ByCenter.query(center=int(centerId))]
    return {"res": forms}
    # forms = Form.get(id="e4548443-99da-4340-b825-3f09921b4bc5", version=1).to_dict()
    # return {'current_request': app.current_request.to_dict(), "forms": forms}

@app.route('/forms/{formId}/render', cors=True, authorizer=iamAuthorizer)
def form_render(formId):
    """Renders schema and schemaModifier. Todo: also modify schema server-side and return just schema & uiSchema."""
    form = Form.get(id=formId, version=1)
    renderedForm = form.to_dict()
    renderedForm["schema"] = FormSchema.get(**form.schema).to_dict()
    renderedForm["schemaModifier"] = FormSchemaModifier.get(**form.schemaModifier).to_dict()
    return {'res': renderedForm }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}

@app.route('/forms/{formId}/responses', cors=True, authorizer=iamAuthorizer)
def form_response_list(formId):
    """Show all responses for a particular form."""
    app.check_permissions(Form.get(id=formId, version=1), "ViewResponses")
    responses = [r.to_dict() for r in Response.query(formId=formId)]
    return {'res': responses }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}

@app.route('/forms/{formId}/summary', cors=True, authorizer=iamAuthorizer)
def form_response_summary(formId):
    """Show response agg. summary"""
    form = Form.get(id=formId, version=1)
    app.check_permissions(form, "ViewResponseSummary")
    dataOptions = FormSchemaModifier.get(**form.schemaModifier).dataOptions
    responses = [r.to_dict() for r in Response.query(formId=formId) if r.PAID == True]
    result = aggregate_data(dataOptions, responses)
    return {"res": result}