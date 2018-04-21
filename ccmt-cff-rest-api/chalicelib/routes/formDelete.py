def form_delete(formId):
  from ..main import app, TABLES
  form = TABLES.forms.get_item(
    Key=dict(id=formId, version=1),
    ProjectionExpression="cff_permissions"
  )["Item"]
  app.check_permissions(form, 'Forms_Delete')
  TABLES.forms.delete_item(
    Key=dict(id=formId, version=1)
  )
  return {"res": None, "success": True, "action": "delete"}