import datetime
import re
from chalicelib.models import Response, serialize_model
from bson.objectid import ObjectId

def response_edit(responseId):
    from ..main import app, TABLES
    return {"id": app.get_current_user_id()}


    # todo: admin response editing.
    # form = Form.get({"_id": ObjectId(responseId)})
    # app.check_permissions(form, "Responses_Edit")
    return edit_response_common(formId, responseId)

def response_checkin(formId, responseId):
    pass