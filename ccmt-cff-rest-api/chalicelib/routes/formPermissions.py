from boto3.dynamodb.conditions import Key
from pydash.arrays import union
POSSIBLE_PERMISSIONS = ("Responses_View", "Responses_Edit", "Responses_View", "Responses_Edit", "Form_PermissionsView", "Form_PermissionsEdit", "Forms_List", "Schemas_List", "Forms_Edit", "SchemaModifiers_Edit")

def form_get_permissions(formId):
  """Get form permission ID's and resolve them into name & email."""
  from ..main import app, TABLES, dynamodb, get_table_name
  form = TABLES.forms.get_item(
      Key=dict(id=formId, version=1),
      ProjectionExpression="cff_permissions"
  )["Item"]
  app.check_permissions(form, 'Forms_PermissionsView')
  userIds = form['cff_permissions'].keys()
  # print([{"id": userId} for userId in userIds])
  users = dynamodb.batch_get_item(RequestItems={
    get_table_name("users"): {
      "Keys": [{"id": userId} for userId in userIds],
      "ProjectionExpression": "#name, email, id",
      "ExpressionAttributeNames": {"#name": "name"},
      "ConsistentRead": True
    }
  })["Responses"][get_table_name("users")]
  user_lookup = {user["id"]: user for user in users}
  return {"res": {"permissions": form['cff_permissions'], "userLookup": user_lookup}}

def form_edit_permissions(formId):
  """Set form permissions of a particular user to an array.
  POST request, with body:
  {
    "userId": "cff:cognitoIdentityId:.....",
    "permissions": ["Responses_Edit", "Responses_View", ""] or string. -- should have all permissions you want user to be assigned to.
  }
  """
  from ..main import app, TABLES
  form = TABLES.forms.get_item(
      Key=dict(id=formId, version=1),
      ProjectionExpression="cff_permissions"
  )["Item"]
  app.check_permissions(form, 'Forms_PermissionsEdit')
  permissions = app.current_request.json_body['permissions']
  userId = app.current_request.json_body['userId']
  for i, v in permissions.items():
    if i not in POSSIBLE_PERMISSIONS:
      raise Exception("Permissions {} is an invalid permission.".format(i))
    if type(v) is not bool:
      raise Exception("Permission {} not formatted correctly; each value should be a boolean.".format({i: v}))
  if "owner" in permissions: # Only owners can add new owners.
    app.check_permissions(form, 'owner')
  # todo: update date last modified, here, too?
  updated_form = TABLES.forms.update_item(
    Key=dict(id=formId, version=1),
    UpdateExpression="SET cff_permissions.#uid = :permissions ",
    ExpressionAttributeValues={":permissions": permissions },
    ExpressionAttributeNames={"#uid": userId},
    ReturnValues="ALL_NEW"
  )["Attributes"]
  return {"res": updated_form['cff_permissions'], "success": True, "action": "update"}
  