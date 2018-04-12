from boto3.dynamodb.conditions import Key
import datetime
import uuid

def form_create(centerId):
    """Creates a new form from a schema, and gives its corresponding schemaModifier.
    POST parameters: {
        "schema": {"id": [id], "version": [version]}
    }
    """
    from ..main import app, TABLES
    form_permissions = {"owner": app.get_current_user_id()}
    schemaRef = app.current_request.json_body["schema"]
    schemaModifier = dict(
        id=uuid.uuid4(),
        version=1,
        date_last_modified=datetime.datetime.now().isoformat(),
        date_created=datetime.datetime.now().isoformat()
    )
    form = dict(
            id=uuid.uuid4(),
            version=1,
            center=centerId,
            cff_permissions=form_permissions,
            schema=schemaRef,
            schemaModifier=dict(id=schemaModifier["id"], version=schemaModifier["version"],
            date_last_modified=datetime.datetime.now().isoformat(),
            date_created=datetime.datetime.now().isoformat())
    )
    # Todo: use a batch write item.
    TABLES.schemaModifier.put_item(
        Item=schemaModifier
    )
    TABLES.forms.put_item(
        Item=form
    )
    return {'res': {'form': form } }