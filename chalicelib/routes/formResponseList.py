from ..util import get_all_responses
from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId

def form_response_list(formId):
    """Show all responses for a particular form."""
    from ..main import app
    form = Form.objects.get(id=ObjectId(formId)).only("formOptions", "cff_permissions")
    app.check_permissions(form, ["Responses_View", "Responses_CheckIn"])
    # todo: use search framework, don't return all!
    responses = Response.objects.raw({"form": Form}).values()
    return {"res": responses}