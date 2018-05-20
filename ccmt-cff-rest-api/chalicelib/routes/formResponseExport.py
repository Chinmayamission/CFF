from ..util import get_all_responses
from ..util.responsesAggregate import aggregate_data
from boto3.dynamodb.conditions import Key

def form_response_export(formId):
    """Export response"""
    """In progress, not done yet."""
    from ..main import app, TABLES
    # form = Form.get(id=formId, version=1)
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="schemaModifier, cff_permissions"
    )["Item"]
    app.check_permissions(form, "Responses_Export")
    # responses = get_all_responses(hash_name="form responses paid {}".format(formId), KeyConditionExpression=Key('formId').eq(formId), FilterExpression=Key('PAID').eq(True))
    # result = aggregate_data(dataOptions, responses)
    return Response(body='hello world!',
                    status_code=200,
                    headers={'Content-Type': 'text/plain'})