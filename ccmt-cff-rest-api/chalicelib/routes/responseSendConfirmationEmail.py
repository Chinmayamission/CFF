from ..util.formSubmit.emailer import send_confirmation_email
from pydash.objects import get

def response_send_confirmation_email(formId, responseId):
  from ..main import app, TABLES
  form = TABLES.forms.get_item(
    Key=dict(id=formId, version=1),
    ProjectionExpression="schemaModifier, formOptions"
  )["Item"]
  response = TABLES.responses.get_item(
    Key=dict(formId=formId, responseId=responseId)
  )["Item"]
  # todo: permissions here?
  if "formOptions" not in form:
    formOptions = TABLES.schemaModifiers.get_item(
        Key=form["schemaModifier"],
        ProjectionExpression="paymentInfo, paymentMethods, confirmationEmailInfo"
      )["Item"]
  else:
    formOptions = form["formOptions"]
  paymentMethod = app.current_request.json_body.get("paymentMethod", "")

  confirmationEmailInfo = get(formOptions, f"paymentMethods.{paymentMethod}.confirmationEmailInfo", formOptions.get("confirmationEmailInfo", {}))
  email = send_confirmation_email(response, confirmationEmailInfo)

  return {"success": True, "email_sent": True, "email": email}