from chalice import Chalice, AuthResponse
from chalicelib.models import Form
import json

app = Chalice(app_name='ccmt-cff-rest-api')
app.debug = True

@app.authorizer()
def basic_auth(auth_request):
    token = auth_request.token
    #app.log.debug("TOKEN IS {}".format(json.dumps(auth_request)))
    # This is just for demo purposes as shown in the API Gateway docs.
    # Normally you'd call an oauth provider, validate the
    # jwt token, etc.
    # In this exampe, the token is treated as the status for demo
    # purposes.
    if token == 'allow':
        return AuthResponse(routes=['/forms/e4548443-99da-4340-b825-3f09921b4bc5'], principal_id='user')
    else:
        # By specifying an empty list of routes,
        # we're saying this user is not authorized
        # for any URLs, which will result in an
        # Unauthorized response.
        return AuthResponse(routes=[''], principal_id='user')

"""
# Home page
http http://localhost:8000/forms/ "Authorization: allow"

# Get form
http http://localhost:8000/forms/e4548443-99da-4340-b825-3f09921b4bc5 "Authorization: allow"

http https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/forms/ "Authorization: allow"
"""
@app.route('/forms')
def index():
    app.log.debug("forms called")
    form = {}
    forms = [form.to_dict() for form in Form.scan()]
    # forms = Form.get(id="e4548443-99da-4340-b825-3f09921b4bc5", version=1).to_dict()
    return {'context': app.current_request.context, "forms": forms}

@app.route('/forms/{formId}', cors=True, authorizer=basic_auth)
def render_form(formId):
    form = Form.get(id=formId, version=1).to_dict()
    return {'hello': form }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}

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
