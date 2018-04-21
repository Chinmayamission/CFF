from pydash.objects import pick
import datetime
from .formRender import get_latest_version, get_versions

def upsert_s_or_sm_entry(collection, data):
  # Helper function. Puts (replaces) item; increments version # if # is "NEW".
  if data["version"] == "NEW":
    data["version"] = get_latest_version(collection, data["id"]) + 1
    data["date_created"] = datetime.datetime.now().isoformat()
  data["date_last_modified"] = datetime.datetime.now().isoformat()
  collection.put_item(
    Item=data
  )
  return data

def form_edit(formId):
  from ..main import app, TABLES
  form = TABLES.forms.get_item(
      Key=dict(id=formId, version=1),
      ProjectionExpression="#schema, schemaModifier, cff_permissions",
      ExpressionAttributeNames={"#schema": "schema"}
  )["Item"]
  app.check_permissions(form, 'Forms_Edit')
  # todo: edit schema and edit schemaModifier permissions.
  body = app.current_request.json_body
  if "schemaModifier" in body:
    if body["schemaModifier"]["id"] != form["schemaModifier"]["id"]:
      raise Exception("SchemaModifier ids don't match; expected {} but got {}.".format(form["schemaModifier"]["id"], body["schemaModifier"]["id"]))
    body["schemaModifier"] = upsert_s_or_sm_entry(TABLES.schemaModifiers, body["schemaModifier"])
  formUpdateExpression = []
  formExpressionAttributeValues = {}
  formExpressionAttributeNames = {}
  if "schema" in body and body["schema"]["version"] != form["schema"]["version"]:
    # schema is a reserved keyword
    formUpdateExpression.append("#schema = :s")
    formExpressionAttributeNames["#schema"] = "schema"
    formExpressionAttributeValues[":s"] = pick(body["schema"], "id", "version")
  if "schemaModifier" in body and body["schemaModifier"] != form["schemaModifier"]:
    formUpdateExpression.append("schemaModifier = :sm")
    formExpressionAttributeValues[":sm"] = pick(body["schemaModifier"], "id", "version")
  if "couponCodes" in body:
    formUpdateExpression.append("couponCodes = :cc")
    formExpressionAttributeValues[":cc"] = body["couponCodes"]
  if "name" in body:
    formUpdateExpression.append("#name = :n")
    formExpressionAttributeNames["#name"] = "name"
    formExpressionAttributeValues[":n"] = body["name"]
  formUpdateExpression.append("date_last_modified = :now")
  formExpressionAttributeValues[":now"] = datetime.datetime.now().isoformat()
  if len(formUpdateExpression) == 0:
    raise Exception("Nothing to update.")
  TABLES.forms.update_item(
    Key=dict(id=formId, version=1),
    UpdateExpression= "SET " + ",".join(formUpdateExpression),
    ExpressionAttributeValues=formExpressionAttributeValues,
    ReturnValues="UPDATED_NEW",
    **(dict(ExpressionAttributeNames=formExpressionAttributeNames) if formExpressionAttributeNames else {})
  )["Attributes"]
  
  response = {}
  response['form'] = TABLES.forms.get_item(
      Key=dict(id=formId, version=1),
      ProjectionExpression="#name, id, version, date_created, date_last_modified, #schema, schemaModifier",
      ExpressionAttributeNames={"#name": "name", "#schema": "schema"}
  )["Item"]

  if 'schema' in body:
    response['schema_versions'] = get_versions(TABLES.schemas, body['schema']['id'])
  if 'schemaModifier' in body:
    response['schemaModifier_versions'] = get_versions(TABLES.schemaModifiers, body['schemaModifier']['id'])
  return {
    "res": {
      "success": True,
      "updated_values": response
    }
  }