from chalicelib.models import Form, serialize_model
from bson.objectid import ObjectId
from bson import BSON


def form_delete(formId):
    """Creates a new form with a blank schema and uiSchema.
    """
    from ..main import app

    form = Form.objects.only("cff_permissions").get({"_id": ObjectId(formId)})
    app.check_permissions(form, "Forms_Delete")
    form.delete()
    return {"res": None, "success": True, "action": "delete", "formId": formId}
