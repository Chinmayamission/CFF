from ..util.responsesAggregate import aggregate_data
from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId

def form_response_summary(formId):
    """Show response agg. summary"""
    from ..main import app
    form = Form.objects.only("formOptions", "cff_permissions").get({"_id":ObjectId(formId)})
    app.check_permissions(form, "Responses_ViewSummary")
    # todo: use aggregation framework here instead.
    responses = Response.objects.raw({"form": form.id, "paid": True})
    responses = serialize_model(responses)
    result = aggregate_data(form.formOptions.dataOptions, responses)
    return {"res": result}