from pydash.objects import pick
import datetime
from chalicelib.models import Form, serialize_model
from bson.objectid import ObjectId

def form_edit(formId):
  from ..main import app, TABLES
  form = Form.objects.get({"_id":ObjectId(formId)})
  app.check_permissions(form, 'Forms_Edit')
  body = pick(app.current_request.json_body, ["schema", "uiSchema", "formOptions", "name"])
  for k, v in body.items():
    setattr(form, k, v)
  form.save()
  return {
    "res": {
      "success": True,
      "updated_values": serialize_model(form)
    }
  }