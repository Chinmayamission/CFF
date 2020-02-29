from chalicelib.models import Response, serialize_model
from pymodm.errors import DoesNotExist
from bson.objectid import ObjectId
from chalice import NotFoundError
from chalice import UnauthorizedError


def response_view(responseId):
    """View an individual response."""
    from ..main import app

    try:
        response = Response.objects.get({"_id": ObjectId(responseId)})
        if response.user and response.user.id == app.get_current_user_id():
            pass # user owns this response
        elif response.form.formOptions.responseCanViewByLink:
            pass # can view response by link
        else:
            app.check_permissions(response.form, ["Responses_View"])
        return {"success": True, "res": serialize_model(response)}
    except DoesNotExist:
        raise NotFoundError(f"Response with ID {responseId} not found")
