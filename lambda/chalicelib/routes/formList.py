from chalicelib.models import Form, serialize_model


def form_list():
    """Get forms user has access to."""
    from ..main import app

    userId = app.get_current_user_id()

    # Get all forms for superusers
    query = (
        {} if app.is_superuser() else {f"cff_permissions.{userId}": {"$exists": True}}
    )

    forms = Form.objects.raw(query).only(
        "name", "cff_permissions", "date_modified", "date_created", "tags"
    )
    forms = serialize_model(list(forms))
    return {"res": forms}
