from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, Response, serialize_model
from pymodm.errors import DoesNotExist
from bson.objectid import ObjectId
from chalice import NotFoundError
from chalicelib.util.renameKey import renameKey
from pydash.objects import get

def form_render(formId):
    from ..main import app
    """Render single form."""
    form = None
    try:
        form = Form.objects.only("name", "schema", "uiSchema", "formOptions").get({"_id": ObjectId(formId)})
        # Convert __$ref back to $ref.
        if form.schema:
            form.schema = renameKey(form.schema, "__$ref", "$ref")
    except DoesNotExist:
        raise NotFoundError(f"Form ID not found: {formId}")
    try:
        response = Response.objects.get({"form": ObjectId(formId), "user": app.get_current_user_id()})
        responseId = str(response.id)
        currentResponse = get(serialize_model(response), "value")
    except DoesNotExist:
        responseId = None
        currentResponse = None
    return {"res": serialize_model(form), "responseId": responseId, "responseData": currentResponse}