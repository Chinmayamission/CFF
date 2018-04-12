def schema_list(centerId):
    from ..main import app, TABLES
    """List all schemas.
    Todo: schemas should belong to a user / center, so check permissions; for now, all schemas are public.
    """
    # app.check_permissions('forms', 'ListForms')
    schemas = TABLES.schemas.scan(
        ProjectionExpression = "id, version, #value.title",
        ExpressionAttributeNames = {"#value": "value"}
    )["Items"]
    return {"res": schemas}