from chalice import UnauthorizedError
from boto3.dynamodb.conditions import Key
from pydash.objects import pick
import datetime

def center_list():
    from ..main import app, TABLES
    userId = app.get_current_user_id()
    # user = User.get(id=userId)
    user = TABLES.users.get_item(
        Key=dict(id=userId)
    )
    if not "Item" in user:
        userItem = {}
        if app.current_request.json_body:
            userItem = pick(app.current_request.json_body, "name", "email")
            userItem["id"] = userId
        else:
            userItem = dict(id=userId)
        userItem["date_created"] = datetime.datetime.now().isoformat()
        userItem["date_last_modified"] = datetime.datetime.now().isoformat()
        TABLES.users.put_item(
            Item=userItem
        )
        raise UnauthorizedError("User is not set up yet.")
    user = user["Item"]
    if not 'centers' in user or not user['centers']:
        raise UnauthorizedError("No centers found for this user.")
    # todo: change this to a batch get.
    centers = [TABLES.centers.get_item(Key=dict(id=centerId))["Item"] for centerId in user['centers']]
    return {"res": centers}