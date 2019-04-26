from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, Response, serialize_model
from pymodm.errors import DoesNotExist
from bson.objectid import ObjectId
from chalice import NotFoundError
from chalicelib.util.renameKey import renameKey
from pydash.objects import get

def form_render(formId):
    """Render single form."""
    form = None
    try:
        form = Form.objects.only("name", "schema", "uiSchema", "formOptions", "cff_permissions").get({"_id": ObjectId(formId)})
        # Convert __$ref back to $ref.
        if form.schema:
            form.schema = renameKey(form.schema, "__$ref", "$ref")
    except DoesNotExist:
        raise NotFoundError(f"Form ID not found: {formId}")
    return {"res": serialize_model(form) }

def form_render_response(formId):
    from ..main import app
    form = Form.objects.only("formOptions").get({"_id": ObjectId(formId)})
    if get(form, "formOptions.loginRequired", False) == True and app.get_current_user_id() != "cm:cognitoUserPool:anonymousUser":
        try:
            response = Response.objects.get({"form": ObjectId(formId), "user": app.get_current_user_id()})
            return {"res": serialize_model(response)}
        except DoesNotExist:
            return {"res": None}
    return {"res": None}