from ..util import get_all_responses
from ..util.responsesAggregate import aggregate_data
from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId

def form_response_summary(formId):
    """Show response agg. summary"""
    from ..main import app, TABLES
    form = Form.objects.get({"_id":ObjectId(formId)}).only("formOptions", "cff_permissions")
    app.check_permissions(form, "Responses_ViewSummary")
    # todo: use aggregation framework here instead.
    responses = Response.objects.raw({"form": Form, "PAID": True}).values()
    result = aggregate_data(form.formOptions["dataOptions"], list(responses))
    return {"res": result}