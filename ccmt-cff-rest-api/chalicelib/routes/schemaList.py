def schema_list(centerId):
    from ..main import app, TABLES
    """List all schemas.
    Todo: schemas should belong to a user / center, so check permissions; for now, all schemas are public.
    """
    # app.check_permissions('forms', 'SchemasList')
    schemas = TABLES.schemas.scan(
        ProjectionExpression = "id, version, #value.title, cff_permissions",
        ExpressionAttributeNames = {"#value": "value"}
    )["Items"]
    return {"res": schemas}