from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, serialize_model
from pymodm.errors import DoesNotExist
from bson.objectid import ObjectId
from chalice import NotFoundError

def form_render(formId):
    """Get forms user has access to."""
    try:
        form = Form.objects.only("name", "schema", "uiSchema", "formOptions").get({"_id": ObjectId(formId)})
        return {"res": serialize_model(form)}
    except DoesNotExist:
        raise NotFoundError(f"Form ID not found: {formId}")