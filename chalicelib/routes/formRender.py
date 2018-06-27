from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, serialize_model
from pymodm.errors import DoesNotExist
from bson.objectid import ObjectId
from chalice import NotFoundError
from chalicelib.util.renameKey import renameKey

def form_render(formId):
    """Render single form."""
    try:
        form = Form.objects.only("name", "schema", "uiSchema", "formOptions").get({"_id": ObjectId(formId)})
        # Convert __$ref back to $ref.
        if form.schema:
            form.schema = renameKey(form.schema, "__$ref", "$ref")
        return {"res": serialize_model(form)}
    except DoesNotExist:
        raise NotFoundError(f"Form ID not found: {formId}")