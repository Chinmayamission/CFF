from pydash.objects import pick
import datetime
from chalicelib.models import Form, serialize_model
from bson.objectid import ObjectId
from chalicelib.util.renameKey import renameKey, replaceKey
from pydash.objects import set_


def form_edit(formId):
    from ..main import app

    form = Form.objects.get({"_id": ObjectId(formId)})
    app.check_permissions(form, "Forms_Edit")
    body = pick(
        app.current_request.json_body,
        ["schema", "uiSchema", "formOptions", "name", "tags"],
    )
    for k, v in body.items():
        setattr(form, k, v)
    # Rename $ref properly.
    if form.schema:
        form.schema = renameKey(form.schema, "$ref", "__$ref")
    if (
        form.formOptions
        and form.formOptions.dataOptions
        and "views" in form.formOptions.dataOptions
    ):
        form.formOptions.dataOptions["views"] = replaceKey(
            replaceKey(form.formOptions.dataOptions["views"], "$", "|"), ".", "||"
        )
    form.save()
    form = Form.objects.get({"_id": ObjectId(formId)})
    return {"res": {"success": True, "updated_values": serialize_model(form)}}


def group_edit(formId):
    from ..main import app

    form = Form.objects.get({"_id": ObjectId(formId)})
    app.check_permissions(form, "Forms_Edit")
    groups = app.current_request.json_body["groups"]
    form.formOptions.dataOptions["groups"] = groups
    form.save()
    return {"res": {"success": True, "form": serialize_model(form)}}
