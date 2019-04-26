from ..util import get_all_responses
from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, Response, serialize_model
import bson
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
        search_fields = get(form.formOptions.dataOptions, "search.searchFields", ["_id"])
        result_limit = get(form.formOptions.dataOptions, "search.resultLimit", 10)
        result_fields = get(form.formOptions.dataOptions, "search.resultFields", ["_id"])
        mongo_query = {"$or": []}
        for field in search_fields:
            if field == "_id":
                if len(query) <= 23:
                    try:
                        queryObjectIdStart = ObjectId(query + "0" * (24 - len(query))) # fill in zeroes to create object id, e.g. 5cba --> 5cba0000000000000000000
                        queryObjectIdEnd = ObjectId(query + "9" * (24 - len(query)))
                        mongo_query["$or"].append({field: {"$gte": queryObjectIdStart, "$lte": queryObjectIdEnd} })
                    except bson.errors.InvalidId:
                        pass
            else:
                mongo_query["$or"].append({field: {"$regex": "^" + query, "$options" : "i"}})
        mongo_query["form"] = form.id
        if len(mongo_query["$or"]) == 0:
            del mongo_query["$or"]
        # Default query paid = True
        if mongo_query:
            mongo_query = {"$and": [{"paid": True}, mongo_query]}
        else:
            {"paid": True}
        projection = {}
        for field in result_fields:
            projection[field] = 1
        responses = Response.objects.raw(mongo_query).limit(result_limit).project(projection)
    else:
        app.check_permissions(form, ["Responses_View"])
        responses = Response.objects.raw({"form": form.id})
    return {"res": [serialize_model(r) for r in responses]}