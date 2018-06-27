from pydash.objects import pick
import datetime
from chalicelib.models import Form, serialize_model
from bson.objectid import ObjectId

def form_edit(formId):
  from ..main import app, TABLES
  form = Form.objects.get(id=ObjectId(formId))
  app.check_permissions(form, 'Forms_Edit')
  body = pick(app.current_request.json_body, ["schema", "uiSchema", "formOptions", "name"])
  form.update(body)

  response = {
    form: serialize_model(form),
    schema_versions: [],
    schemaModifier_versions: []
  }
  return {
    "res": {
      "success": True,
      "updated_values": response
    }
  }