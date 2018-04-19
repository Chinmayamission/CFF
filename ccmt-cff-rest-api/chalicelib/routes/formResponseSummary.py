from ..util import get_all_responses
from ..util.responsesAggregate import aggregate_data
from boto3.dynamodb.conditions import Key

def form_response_summary(formId):
    """Show response agg. summary"""
    from ..main import app, TABLES
    # form = Form.get(id=formId, version=1)
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="schemaModifier, cff_permissions"
    )["Item"]
    app.check_permissions(form, "Responses_ViewSummary")
    dataOptions = TABLES.schemaModifiers.get_item(
        Key=form["schemaModifier"],
        ProjectionExpression="dataOptions"
    )["Item"].get("dataOptions", {})
    responses = get_all_responses(KeyConditionExpression=Key('formId').eq(formId), FilterExpression=Key('PAID').eq(True))
    result = aggregate_data(dataOptions, responses)
    return {"res": result}