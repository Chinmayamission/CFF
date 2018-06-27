from boto3.dynamodb.conditions import Key
from chalicelib.models import Form, serialize_model

def form_list():
    """Get forms user has access to."""
    from ..main import app, TABLES
    userId = app.get_current_user_id()
    forms = Form.objects.raw({f"cff_permissions.{userId}": {"$exists": True}}).only("name", "cff_permissions")
    return {"res": serialize_model(list(forms))}