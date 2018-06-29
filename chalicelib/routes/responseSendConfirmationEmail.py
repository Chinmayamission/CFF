from ..util.formSubmit.emailer import send_confirmation_email
from pydash.objects import get
from chalicelib.models import Form, serialize_model
from bson.objectid import ObjectId

def response_send_confirmation_email(responseId):
  from ..main import app, TABLES
  response = Response.objects.get({"_id":ObjectId(responseId)})
  form = Form.objects.only("formOptions").get({"_id":response.form.id})
  # todo: permissions here?
  paymentMethod = (app.current_request.json_body or {}).get("paymentMethod", "")

  confirmationEmailInfo = get(form.formOptions.paymentMethods, f"{paymentMethod}.confirmationEmailInfo", form.formOptions.confirmationEmailInfo)
  email = send_confirmation_email(serialize_model(response), confirmationEmailInfo)

  return {"success": True, "email_sent": True, "email": email}