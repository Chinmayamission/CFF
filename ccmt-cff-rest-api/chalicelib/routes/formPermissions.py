from boto3.dynamodb.conditions import Key
from pydash.arrays import union
POSSIBLE_PERMISSIONS = ("Responses_View", "Responses_Edit", "ViewResponses", "EditResponses", "Permissions_Get", "Permissions_Edit", "Forms_List", "Schemas_List", "Forms_Edit", "SchemaModifiers_Edit")

def form_get_permissions(formId):
  """Get form permission ID's and resolve them into name & email."""
  from ..main import app, TABLES, dynamodb, get_table_name
  form = TABLES.forms.get_item(
      Key=dict(id=formId, version=1),
      ProjectionExpression="cff_permissions"
  )["Item"]
  app.check_permissions(form, 'Forms_PermissionsView')
  userIds = []
  for permUserIds in form['cff_permissions'].values():
    for permUserId in permUserIds:
      if permUserId not in userIds:
        userIds.append(permUserId)
  print([{"id": userId} for userId in userIds])
  users = dynamodb.batch_get_item(RequestItems={
    get_table_name("users"): {
      "Keys": [{"id": userId} for userId in userIds],
      "ProjectionExpression": "#name, email, id",
      "ExpressionAttributeNames": {"#name": "name"},
      "ConsistentRead": True
    }
  })["Responses"][get_table_name("users")]
  userLookup = {user["id"]: user for user in users}
  resolved_permissions = {permName: [userLookup[userId] for userId in permUserIds] for permName, permUserIds in form['cff_permissions'].items()}
  return {"res": resolved_permissions}

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
  permissions = app.current_request.json_body['permissions']
  userId = app.current_request.json_body['userId']
  if "owner" in permissions:
    # Only owners can add new owners.
    app.check_permissions(form, 'owner')
  else:
    app.check_permissions(form, 'Forms_PermissionsEdit')
  expressionAttributeNames = {"#{}".format(p) : p for p in permissions}
  expressionAttributeValues = {":userId": [userId], ":empty_list": []} #, ":now": datetime.datetime.now().isoformat() }
  updateExpression = "SET " + ", ".join(["cff_permissions.#{0} = list_append(if_not_exists(cff_permissions.#{0}, :empty_list), :userId)".format(p) for p in permissions])
  print(updateExpression)
  # todo: update date last modified, here, too?
  TABLES.forms.update_item(
    Key=dict(formId=formId, version=1),
    UpdateExpression=updateExpression,
    ExpressionAttributeValues=expressionAttributeValues,
    ExpressionAttributeNames=expressionAttributeNames,
    ReturnValues="ALL_NEW"
  )["Attributes"]
  return {"res": permissions, "success": True, "action": "update"}
  