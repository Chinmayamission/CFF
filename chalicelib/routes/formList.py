from boto3.dynamodb.conditions import Key

def form_list(centerId):
    from ..main import app, TABLES
    # app.check_permissions('forms', 'FormsList')
    forms = TABLES.forms.query(
        IndexName='center-index',
        KeyConditionExpression=Key('center').eq(int(centerId)),
        ProjectionExpression = "id, version, #name, date_last_modified, date_created, cff_permissions, #schema, schemaModifier",
        ExpressionAttributeNames = {"#name": "name", "#schema": "schema"}
    )["Items"]
    return {"res": forms}
    # forms = Form.get(id="e4548443-99da-4340-b825-3f09921b4bc5", version=1).to_dict()
    # return {'current_request': app.current_request.to_dict(), "forms": forms}