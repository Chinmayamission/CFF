from chalicelib.models import Form, Org, serialize_model
from bson.objectid import ObjectId
from pydash.arrays import union
import boto3

POSSIBLE_PERMISSIONS = {
    "Form": [
        "owner",
        "Responses_View",
        "Responses_Export",
        "Responses_ViewSummary",
        "Responses_Edit",
        "Responses_AdminInfo_Edit",
        "Responses_Delete",
        "Responses_CheckIn",
        "Responses_AddPayment",
        "Responses_SendEmail",
        "Forms_Edit",
        "Forms_PermissionsView",
        "Forms_PermissionsEdit",
    ],
    "Org": [
        "owner",
        "Orgs_FormsCreate",
    ]
  }  # "Form_PermissionsView", "Form_PermissionsEdit", "Forms_List", "Schemas_List", "SchemaModifiers_Edit"]


def list_all_users(userIds):
    from chalicelib.config import USER_POOL_ID

    user_lookup = {}
    client = boto3.client("cognito-idp", region_name="us-east-1")
    for userIdFull in userIds:
        if "cm:cognitoUserPool:" in userIdFull:
            try:
                _, userId = userIdFull.split("cm:cognitoUserPool:")
                response = client.admin_get_user(
                    UserPoolId=USER_POOL_ID, Username=userId
                )
                attributes = {
                    attr["Name"]: attr["Value"] for attr in response["UserAttributes"]
                }
                user_lookup[userIdFull] = {
                    "name": attributes["name"],
                    "email": attributes["email"],
                    "id": userIdFull,
                }
            # except client.exceptions.UserNotFoundException:
            except Exception:
                user_lookup[userIdFull] = {
                    "name": "unknown",
                    "email": "unknown",
                    "id": userIdFull,
                }
        else:
            user_lookup[userIdFull] = {
                "name": "unknown",
                "email": "unknown",
                "id": userIdFull,
            }
    return user_lookup


def get_user_by_email(email):
    from chalicelib.config import USER_POOL_ID

    client = boto3.client("cognito-idp", region_name="us-east-1")
    response = client.list_users(
        UserPoolId=USER_POOL_ID,
        AttributesToGet=["sub"],
        Limit=1,
        Filter='email ^= "{}"'.format(email),
    )
    if len(response["Users"]) == 0:
        return None
    return response["Users"][0]["Username"]


def _model_get_permissions(model, model_name):
    from ..main import app
    userIds = model.cff_permissions.keys()
    user_lookup = list_all_users(userIds)
    return {
        "res": {
            "permissions": model.cff_permissions,
            "userLookup": user_lookup,
            "possiblePermissions": POSSIBLE_PERMISSIONS[model_name],
        }
    }

def _model_edit_permissions(model, model_name):
    from ..main import app
    permissions = app.current_request.json_body["permissions"]
    userId = app.current_request.json_body.get("userId", None)
    email = app.current_request.json_body.get("email", None)
    if (
        "owner" in permissions and permissions["owner"] == True
    ):  # Only owners can add new owners.
        app.check_permissions(model, "owner")
    for i, v in permissions.items():
        if i not in POSSIBLE_PERMISSIONS[model_name]:
            raise Exception("Permissions {} is an invalid permission.".format(i))
        if type(v) is not bool:
            raise Exception(
                "Permission {} not formatted correctly; each value should be a boolean.".format(
                    {i: v}
                )
            )
    # todo: update date last modified, here, too?
    if not userId:
        if not email:
            raise Exception("Either userId or email must be specified.")
        userId = get_user_by_email(email.strip())
        if not userId:
            raise Exception("User not found for specified email.")
        userId = "cm:cognitoUserPool:" + userId
    if permissions == {} and userId in model.cff_permissions:
        del model.cff_permissions[userId]
    else:
        model.cff_permissions[userId] = permissions
    model.save()
    response = {
        "res": {"permissions": model.cff_permissions},
        "success": True,
        "action": "update",
    }
    if email:
        # Return additional userLookup object when adding a new email.
        response["res"]["userLookup"] = list_all_users([userId])
    return response

def form_get_permissions(formId):
    """
  Get form permission user ID's and resolve them into name & email.
  Auth Required: owner, Forms_PermissionView
  query_params:
  ?mine=1 -- only get my permission names (for logged in user) - requires no auth except for being logged in. (This is currently not used).
  """
    from ..main import app
    form = Form.objects.only("cff_permissions").get({"_id": ObjectId(formId)})
    if app.current_request.query_params and "mine" in app.current_request.query_params:
        permissions = app.get_user_permissions(app.get_current_user_id(), form)
        return {"res": {"permissions": permissions}}
    app.check_permissions(form, "Forms_PermissionsView")
    return _model_get_permissions(form, "Form")

def form_edit_permissions(formId):
    """Set form permissions of a particular user to an array.
  POST request, with body: (either userId or email is required.)
  {
    "userId": "cm:cognitoUserPool:.....",
    "email": "a@b.com",
    "permissions": ["Responses_Edit", "Responses_View", ""] or string. -- should have all permissions you want user to be assigned to.
  }
  """
    from ..main import app

    form = Form.objects.get({"_id": ObjectId(formId)})
    app.check_permissions(form, "Forms_PermissionsEdit")
    return _model_edit_permissions(form, "Form")

def org_get_permissions(orgId):
    """Just like form_get_permissions."""
    from ..main import app
    org = app.get_org()
    app.check_permissions(org, [])
    return _model_get_permissions(org, "Org")

def org_edit_permissions(orgId):
    """Just like form_edit_permissions."""
    from ..main import app
    org = app.get_org()
    app.check_permissions(org, [])
    return _model_edit_permissions(org, "Org")