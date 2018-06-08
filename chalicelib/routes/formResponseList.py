from ..util import get_all_responses
from boto3.dynamodb.conditions import Key

def form_response_list(formId):
    """Show all responses for a particular form."""
    from ..main import app, TABLES
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1)
    )["Item"]
    app.check_permissions(form, ["Responses_View", "Responses_CheckIn"])
    responses = get_all_responses(hash_name="form responses {}".format(formId), KeyConditionExpression=Key('formId').eq(formId))
    return {'res': responses }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}