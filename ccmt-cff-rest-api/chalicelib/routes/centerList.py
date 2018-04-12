from chalice import UnauthorizedError
from boto3.dynamodb.conditions import Key

def center_list():
    from ..main import app, TABLES
    userId = app.get_current_user_id()
    # user = User.get(id=userId)
    user = TABLES.users.get_item(
        Key=dict(id=userId)
    )
    if not "Item" in user:
        # User(id=userId, date_created = datetime.datetime.now()).save() todo: this doesn't work with datetime.
      TABLES.users.put_item(
        Item=dict(id=userId)
      )
      # User(id=userId).save()
      raise UnauthorizedError("User is not set up yet.")
    user = user["Item"]
    if not 'centers' in user or not user['centers']:
        raise UnauthorizedError("No centers found for this user.")
    # todo: change this to a batch get.
    centers = [TABLES.centers.get_item(Key=dict(id=centerId))["Item"] for centerId in user['centers']]
    return {"res": centers}