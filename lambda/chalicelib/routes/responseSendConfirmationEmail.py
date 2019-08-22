from ..util.formSubmit.emailer import send_confirmation_email
from pydash.objects import get
from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId


def response_send_confirmation_email(responseId):
    from ..main import app

    response = Response.objects.get({"_id": ObjectId(responseId)})
    form = Form.objects.only("formOptions").get({"_id": response.form.id})
    # todo: permissions here?
    paymentMethod = (app.current_request.json_body or {}).get("paymentMethod", "")

    if response.pending_update:
        old_value = response.value
        old_paymentInfo = response.paymentInfo
        response.value = response.pending_update["value"]
        response.paymentInfo = response.pending_update["paymentInfo"]
        confirmationEmailInfo = get(
            form.formOptions.paymentMethods,
            f"{paymentMethod}.confirmationEmailInfo",
            form.formOptions.confirmationEmailInfo,
        )
        email = send_confirmation_email(response, confirmationEmailInfo)
        response.value = old_value
        response.paymentInfo = old_paymentInfo
    else:
        confirmationEmailInfo = get(
            form.formOptions.paymentMethods,
            f"{paymentMethod}.confirmationEmailInfo",
            form.formOptions.confirmationEmailInfo,
        )
        email = send_confirmation_email(response, confirmationEmailInfo)

    response.save()

    return {"success": True, "email_sent": True, "email": email}
