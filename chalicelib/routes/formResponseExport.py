from chalicelib.models import Form, Response, serialize_model
from bson.objectid import ObjectId

def form_response_export(formId):
    """Export response"""
    """In progress, not done yet."""
    from ..main import app
    form = Form.objects.get(id=ObjectId(formId)).only("formOptions", "cff_permissions")
    app.check_permissions(form, "Responses_Export")
    # responses = Response.objects.raw({"form": Form}).values()
    return {"res": responses}
    return Response(body='hello world!',
                    status_code=200,
                    headers={'Content-Type': 'text/plain'})