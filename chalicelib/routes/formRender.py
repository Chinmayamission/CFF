from boto3.dynamodb.conditions import Key

def get_versions(collection, id, limit = None):
    kwargs = {
        "KeyConditionExpression":Key('id').eq(id),
        "ProjectionExpression":"version, date_created, date_last_modified",
        "ScanIndexForward": False # sort in descending order.
    }
    if limit:
        kwargs["Limit"] = limit
    return collection.query(**kwargs)['Items']

def get_latest_version(collection, id):
    return get_versions(collection, id, 1)[0]["version"]

def form_render(formId):
    from ..main import app, TABLES
    """Renders schema and schemaModifier. Todo: also modify schema server-side and return just schema & uiSchema.
    Todo: get coupon codes."""
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        # todo: need to return schemaModifier.
        ProjectionExpression="#name, id, version, date_created, date_last_modified, #schema, uiSchema, schemaModifier, formOptions",
        ExpressionAttributeNames={"#name": "name", "#schema": "schema"}
    )["Item"]
    if "uiSchema" in form:
        # Everything is good here.
        pass
    else:
        form["schema"] = TABLES.schemas.get_item(
            Key=form["schema"]
        )["Item"]
        form["schemaModifier"] = TABLES.schemaModifiers.get_item(
            Key=form["schemaModifier"]
        )["Item"]
        if app.current_request.query_params and "versions" in app.current_request.query_params:
            form["schema_versions"] = get_versions(TABLES.schemas, form["schema"]["id"])
            form["schemaModifier_versions"] = get_versions(TABLES.schemas, form["schemaModifier"]["id"])
    return {'res': form }