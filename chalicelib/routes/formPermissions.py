from chalicelib.models import Form, serialize_model
from bson.objectid import ObjectId
from pydash.arrays import union
POSSIBLE_PERMISSIONS = ["owner", "Responses_View", "Responses_Export", "Responses_ViewSummary", "Responses_Edit", "Responses_CheckIn", "Forms_Edit", "Forms_PermissionsView", "Forms_PermissionsEdit"] # "Form_PermissionsView", "Form_PermissionsEdit", "Forms_List", "Schemas_List", "SchemaModifiers_Edit"]

def form_render(formId):
    """Get forms user has access to."""
    form = Form.objects.get({"_id":ObjectId(formId)}).only("name", "date_created", "date_last_modified", "schema", "uiSchema", "formOptions")
    return {"res": form}

def form_get_permissions(formId):
  """
  Get form permission user ID's and resolve them into name & email.
  Auth Required: owner, Forms_PermissionView
  query_params:
  ?mine=1 -- only get my permission names (for logged in user) - requires no auth except for being logged in. (This is currently not used).
  """
  from ..main import app
  form = Form.objects.only("cff_permissions").get({"_id":ObjectId(formId)})
  if app.current_request.query_params and "mine" in app.current_request.query_params:
    permissions = app.get_user_permissions(app.get_current_user_id(), form)
    return {"res": {"permissions": permissions}}
  app.check_permissions(form, 'Forms_PermissionsView')
  userIds = form.cff_permissions.keys()
  user_lookup = {userId: {"name": "Test", "email": "test@test.com", "id": userId} for userId in userIds}
  return {"res": {"permissions": form.cff_permissions, "userLookup": user_lookup, "possiblePermissions": POSSIBLE_PERMISSIONS}}

def form_edit_permissions(formId):
  """Set form permissions of a particular user to an array.
  POST request, with body:
  {
    "userId": "cff:cognitoIdentityId:.....",
    "permissions": ["Responses_Edit", "Responses_View", ""] or string. -- should have all permissions you want user to be assigned to.
  }
  """
  from ..main import app
  form = Form.objects.get({"_id":ObjectId(formId)})
  app.check_permissions(form, 'Forms_PermissionsEdit')
  permissions = app.current_request.json_body['permissions']
  userId = app.current_request.json_body['userId']
  if "owner" in permissions and permissions["owner"] == True: # Only owners can add new owners.
    app.check_permissions(form, 'owner')
  for i, v in permissions.items():
    if i not in POSSIBLE_PERMISSIONS:
      raise Exception("Permissions {} is an invalid permission.".format(i))
    if type(v) is not bool:
      raise Exception("Permission {} not formatted correctly; each value should be a boolean.".format({i: v}))
  # todo: update date last modified, here, too?
  form.cff_permissions[userId] = permissions
  form.save()
  return {"res": form.cff_permissions, "success": True, "action": "update"}
  