from chalicelib.models import Form, Response, serialize_model
from pymodm.errors import DoesNotExist
from bson.objectid import ObjectId
from chalice import NotFoundError
from chalicelib.util.renameKey import renameKey, replaceKey
from pydash.objects import get
from chalicelib.util.patch import patch_predicate
from chalicelib.routs.formPermissions import get_user_by_email, resend_confirmation_code


def form_user_lookup(formId):
    """Lookup a single user.
    Request body:
    {
        "email": "a@b.com"
    }

    Response:

    {
        "success": true,
        "message": "..."
    }
    """
    form = Form.objects.only(
        "formOptions", "cff_permissions"
    ).get({"_id": ObjectId(formId)})
    request_body = app.current_request.json_body or {}
    email = request_body["email"]
    responses = Response.objects.filter({"value.email": email}).limit(1) # todo: error on multiple results
    responses = list(responses)
    if len(responses) == 0:
        return {
            "res": {
                "success": False,
                "message": "Response not found"
            }
        }
    userId, confirmed = get_user_by_email(email)
    if userId and confirmed:
        return {
            "res": {
                "success": False,
                "message": "User already confirmed"
            }
        }
    elif userId and not confirmed:
        resend_confirmation_code(userId)
        return {
            "res": {
                "success": True,
                "message": "Resent confirmation code"
            }
        }
    userId = create_user(email)
    user = User(id=userId)
    user.save()
    response = responses[0]
    response.user = user
    response.save()
    return {"res": {"success": True, "userId": "" }}
    # return {"res": serialize_model(form)}