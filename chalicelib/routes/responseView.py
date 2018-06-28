from boto3.dynamodb.conditions import Key
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
        if True:
        # if response.user == app.get_current_user_id() or app.check_permissions(response.select_related("form"), ["Responses_View", "Responses_CheckIn"]):
          return {"success": True, "res": serialize_model(response)}
        else:
          raise UnauthorizedError("Unauthorized to access this response.")
    except DoesNotExist:
        raise NotFoundError(f"Response with ID {responseId} not found")