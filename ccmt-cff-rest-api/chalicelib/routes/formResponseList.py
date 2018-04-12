from ..util import get_all_responses
from boto3.dynamodb.conditions import Key

def form_response_list(formId):
    """Show all responses for a particular form."""
    from ..main import app, TABLES
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1)
    )["Item"]
    app.check_permissions(form, "ViewResponses")
    responses = get_all_responses(KeyConditionExpression=Key('formId').eq(formId))
    # responses = [r.to_dict() for r in Response.query(formId=formId)]
    return {'res': responses }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}