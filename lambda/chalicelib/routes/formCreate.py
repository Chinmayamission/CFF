import datetime
import uuid
from pydash.objects import pick
from chalicelib.models import Form, Org, FormOptions, serialize_model
from bson.objectid import ObjectId
from pymodm.errors import DoesNotExist
from chalice import UnauthorizedError


def form_create():
    """Creates a new form with a blank schema and uiSchema.
    """
    from ..main import app

    request_body = app.current_request.json_body or {}

    # todo: multiple orgs?
    try:
        org = Org.objects.get({})
    except DoesNotExist:
        raise UnauthorizedError(
            "Organization does not exist, so forms cannot be created."
        )
    app.check_permissions(org, ["Orgs_FormsCreate"])

    if request_body.get("formId", None):
        # todo: add permissions check on forms -- some forms should not be able to be duplicated.
        formId = request_body.get("formId", None)
        old_form = Form.objects.get({"_id": ObjectId(formId)})
        form = Form(
            name=old_form.name + " Copy - " + datetime.datetime.now().isoformat(),
            version=1,
            center="None",
            id=ObjectId(),
            cff_permissions={app.get_current_user_id(): {"owner": True}},
            schema=old_form.schema,
            uiSchema=old_form.uiSchema,
            formOptions=old_form.formOptions,
            date_modified=datetime.datetime.now().isoformat(),
            date_created=datetime.datetime.now().isoformat(),
        )
        form.save()
        return {"res": {"form": serialize_model(form)}}
    else:
        form_name = request_body.get(
            "form_name", "Untitled form {}".format(datetime.datetime.now().isoformat())
        )
        form = Form(
            name=form_name,
            version=1,
            center="None",
            id=ObjectId(),
            cff_permissions={app.get_current_user_id(): {"owner": True}},
            schema={
                "title": "Form",
                "type": "object",
                "properties": {"name": {"type": "string"}},
            },
            uiSchema={"name": {"ui:placeholder": "Name"}},
            formOptions=FormOptions(
                confirmationEmailInfo={},
                paymentInfo={},
                paymentMethods={},
                dataOptions={},
                defaultFormData={},
            ),
            date_modified=datetime.datetime.now().isoformat(),
            date_created=datetime.datetime.now().isoformat(),
        )
        form.save()
        return {"res": {"form": serialize_model(form)}}
