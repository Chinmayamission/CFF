from .emailer import send_confirmation_email
import datetime

def response_verify_update(response, responsesCollection, confirmationEmailInfo):
    """replace response value with pending update. called by ipn and otherwise when editing a form and the price doesn't change.
    Also sends an email notifying the user about the update."""
    response = responsesCollection.update_item(
        Key={
            'formId': response["formId"],
            'responseId': response["responseId"]
        },
        UpdateExpression=("REMOVE PENDING_UPDATE "
        " SET UPDATE_HISTORY = list_append(if_not_exists(UPDATE_HISTORY, :empty_list), :updateHistory),"
        " #value = :value,"
        " modifyLink = :modifyLink,"
        " PAID = :paid,"
        " paymentInfo = :paymentInfo"),
        ExpressionAttributeValues={
            ':updateHistory': [{
                "date": datetime.datetime.now().isoformat(),
                "action": "updated",
                "UPDATE_VALUE": response["PENDING_UPDATE"]
            }],
            ":paid": True, # fullyPaid is true.
            ":value": response["PENDING_UPDATE"].get("value", None),
            ":modifyLink": response["PENDING_UPDATE"].get("modifyLink", None),
            ":paymentInfo": response["PENDING_UPDATE"].get("paymentInfo", None),
            ":empty_list": []                           
        },
        ExpressionAttributeNames={
            "#value": "value"
        },
        ReturnValues="ALL_NEW")["Attributes"]
    confirmationEmailInfo["subject"] += " - Response Updated"
    send_confirmation_email(response, confirmationEmailInfo)
    return response