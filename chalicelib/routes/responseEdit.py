import datetime
import re
from chalicelib.models import Response, UpdateTrailItem, serialize_model
from bson.objectid import ObjectId
from pydash.objects import get, set_

def response_edit(responseId):
    from ..main import app, TABLES
    response = Response.objects.get({"_id": ObjectId(responseId)})
    app.check_permissions(response.form, "Responses_Edit")
    path = app.current_request.json_body["path"]
    value = app.current_request.json_body["value"]
    existing_value = get(response.value, path, value)
    if type(existing_value) is bool and value.lower() in ("true", "false"):
        value = value.lower() == "true"
    elif type(existing_value) is float and value.isdigit():
        value = float(value)
    elif type(existing_value) is int and value.isdigit():
        value = int(value)
    set_(response.value, path, value)
    response.update_trail.append(
        UpdateTrailItem(
            path=path,
            old_value=existing_value,
            new_value=value,
            date=datetime.datetime.now(),
            user=app.get_current_user_id()
        )
    )
    response.save()
    return {"res": {"success": True, "response": serialize_model(response)}}


def response_checkin(formId, responseId):
    pass