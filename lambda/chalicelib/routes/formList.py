from chalicelib.models import Form, serialize_model

def form_list():
    """Get forms user has access to."""
    from ..main import app
    userId = app.get_current_user_id()
    forms = Form.objects.raw({f"cff_permissions.{userId}": {"$exists": True}}).only("name", "cff_permissions", "date_modified", "date_created", "tags")
    forms = list(forms)
    tag_ids = []
    for form in forms:
        if form.tags:
            tag_ids += form.tags
    tag_dict = {str(tag.id): tag for tag in Tag.objects.raw({"_id": {"$in": tag_ids } })}
    for form in forms:
        if form.tags:
            form.tags = [tag_dict[tag_id] for i, tag_id in enumerate(form.tags)]
    forms = serialize_model(forms)
    return {"res": forms}