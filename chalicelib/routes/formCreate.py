from boto3.dynamodb.conditions import Key
import datetime
import uuid
from pydash.objects import pick
from chalicelib.models import Form, FormOptions, serialize_model
from bson.objectid import ObjectId
from bson import BSON

def form_create():
    """Creates a new form with a blank schema and uiSchema.
    """
    from ..main import app, TABLES
    # todo: add permissions check.
    form_permissions = {app.get_current_user_id(): {"owner": True}}
    # schemaRef = pick(app.current_request.json_body["schema"], "id", "version") 
    form_name = (app.current_request.json_body or {}).get("form_name", "Untitled form {}".format(datetime.datetime.now().isoformat()))
    form = Form(
        name=form_name,
        version=1,
        center="None",
        id = ObjectId(),
        cff_permissions=form_permissions,
        schema={"title": "Form", "type": "object", "properties": {"name": {"type": "string"}}},
        uiSchema={"name": {"ui:placeholder": "Name"}},
        formOptions=FormOptions(confirmationEmailInfo={}, paymentInfo={}, paymentMethods={}, dataOptions={}, defaultFormData={}),
        date_modified=datetime.datetime.now().isoformat(),
        date_created=datetime.datetime.now().isoformat()
    )
    form.save()
    return {'res': {'form': serialize_model(form) } }