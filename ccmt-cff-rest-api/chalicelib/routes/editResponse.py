import datetime
import re

def edit_response_common(formId, responseId):
    """Common function used both by edit response and response checkin.
    Edit an individual response from the admin dashboard.
    """
    from ..main import app, TABLES
    path = app.current_request.json_body["path"]
    value = app.current_request.json_body["value"]
    # Todo: make sure path is not one of the reserved keywords, by using expressionattributenames.
    # Todo: replace spaces in path, only letters & dots allowed.
    path = path.replace(" ", "")
    pathNames = path.split(".")
    expressionAttributeNames = {}
    escapedPath = ""
    for pathName in pathNames:
        if not pathName:
            continue
        if escapedPath != "":
            escapedPath += "."
        if pathName.isdigit():
            escapedPath += pathName
        else:
            pathName_escaped = "#cff{}".format(pathName)
            expressionAttributeNames[pathName_escaped] = pathName
            escapedPath += pathName_escaped
    # Converts a.2.3.asd.dsgdf.34.6 to a[2][3].asd.dsgdf[34][6]
    escapedPath = re.sub(r'\.(\d+)', lambda x: "[{}]".format(x.group(1)), escapedPath)
    # raise Exception("{}, {}".format(path, expressionAttributeNames))
    result = TABLES.responses.update_item(
        Key=dict(formId=formId, responseId=responseId),
        UpdateExpression= "SET {} = :value,"
            "UPDATE_HISTORY = list_append(if_not_exists(UPDATE_HISTORY, :empty_list), :updateHistory),"
            "date_last_modified = :now".format(escapedPath),
        ExpressionAttributeValues={
            ":value": value,
            ":now": datetime.datetime.now().isoformat(),
            ':updateHistory': [{
                "date": datetime.datetime.now().isoformat(),
                "action": "admin_update_ResponsesEdit",
                "author": app.get_current_user_id(),
                "path": path,
                "value": value
            }],
            ":empty_list": []
        },
        ExpressionAttributeNames=expressionAttributeNames,
        ReturnValues="ALL_NEW"
    )["Attributes"]
    return {"res": result, "success": True, "action": "update"}
    # todo: return a better, more uniform response.

def edit_response(formId, responseId):
    from ..main import app, TABLES
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="cff_permissions"
    )["Item"]
    app.check_permissions(form, "Responses_Edit")

def response_checkin(formId, responseId):
    from ..main import app, TABLES
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="cff_permissions"
    )["Item"]
    app.check_permissions(form, "Responses_CheckIn")
    return edit_response_common(formId, responseId)