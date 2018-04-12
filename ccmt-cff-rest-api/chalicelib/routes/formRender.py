def form_render(formId):
    from ..main import app, TABLES
    """Renders schema and schemaModifier. Todo: also modify schema server-side and return just schema & uiSchema."""
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="#name, id, version, date_created, date_last_modified, #schema, schemaModifier",
        ExpressionAttributeNames={"#name": "name", "#schema": "schema"}
    )["Item"]
    form["schema"] = TABLES.schemas.get_item(
        Key=form["schema"]
    )["Item"]
    form["schemaModifier"] = TABLES.schemaModifiers.get_item(
        Key=form["schemaModifier"]
    )["Item"]
    return {'res': form }