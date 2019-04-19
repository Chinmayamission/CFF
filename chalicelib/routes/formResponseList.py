from ..util import get_all_responses
from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId
from pydash.objects import get

def form_response_list(formId):
    """Show all responses for a particular form."""
    from ..main import app
    form = Form.objects.only("formOptions", "cff_permissions").get({"_id":ObjectId(formId)})
    # todo: use search framework, don't return all!
    query = app.current_request.query_params and app.current_request.query_params.get("query", None)
    if query:
        app.check_permissions(form, ["Responses_View", "Responses_Checkin"])
        search_fields = get(form.formOptions, "dataOptions.search.searchFields", ["_id"])
        result_limit = get(form.formOptions, "dataOptions.search.resultLimit", 10)
        result_fields = get(form.formOptions, "dataOptions.search.resultFields", ["_id"])
        mongo_query = {}
        for field in search_fields:
            mongo_query[field] = {"$regex": "^" + query}
        mongo_query["form"] = form.id
        projection = {}
        for field in result_fields:
            projection[field] = 1
        responses = Response.objects.raw({"form": form.id}).limit(result_limit).project(projection)
    else:
        app.check_permissions(form, ["Responses_View"])
        responses = Response.objects.raw({"form": form.id})
    return {"res": [serialize_model(r) for r in responses]}