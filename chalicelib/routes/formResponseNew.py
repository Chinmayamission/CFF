import uuid
from chalice import UnauthorizedError
import datetime
from pydash.objects import pick, get, unset
from ..util.formSubmit.util import calculate_price
from ..util.formSubmit.couponCodes import coupon_code_verify_max_and_record_as_used
from ..util.formSubmit.emailer import send_confirmation_email
from ..util.formSubmit.ccavenue import update_ccavenue_hash
from ..util.formSubmit.paymentMethods import fill_paymentMethods_with_data
from ..util.responseUploadImages import process_response_data_images
from chalicelib.models import Form, Response, User, UpdateTrailItem, serialize_model
from bson.objectid import ObjectId
from pymodm.errors import DoesNotExist

def get_user_or_create_one(userId):
    user = None
    try:
        user = User.objects.get({"_id": userId})
    except DoesNotExist:
        user = User(id=userId)
        user.save()
    return user

def form_response_new(formId):
    """
    Payload: 
    {
        "data": formData,
        "modifyLink": "...",
        "responseId"?: "asdsadasd"
    }
    If responseId is defined, it is an update.
    Otherwise, it is an existing submission.
    """
    from ..main import app
    email_sent = False
    responseId = app.current_request.json_body.get("responseId", None)
    if not responseId:
        responseId = ObjectId()
        newResponse = True
    else:
        responseId = ObjectId(responseId)
        newResponse = False

    response_data = app.current_request.json_body["data"]
    response_data = process_response_data_images(response_data)
    modify_link = app.current_request.json_body.get('modifyLink', '')
    form = Form.objects.only("name", "schema", "uiSchema", "formOptions", "cff_permissions", "couponCodes_used").get({"_id":ObjectId(formId)}) #couponCodes
    paymentInfo = form.formOptions.paymentInfo
    confirmationEmailInfo = form.formOptions.confirmationEmailInfo
    paymentMethods = fill_paymentMethods_with_data(form.formOptions.paymentMethods, response_data)

    def calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo):
        paymentInfoItem['amount'] = calculate_price(paymentInfoItem.get('amount', '0'), response_data)
        paymentInfoItem['quantity'] = calculate_price(paymentInfoItem.get('quantity', '0'), response_data)
        paymentInfo['total'] += paymentInfoItem['amount'] * paymentInfoItem['quantity']
    paymentInfoItemsWithTotal = []
    paymentInfo['total'] = 0
    for paymentInfoItem in paymentInfo.setdefault('items', []):
        paymentInfoItem.setdefault("name", "Payment Item")
        paymentInfoItem.setdefault("description", "Payment Item")
        paymentInfoItem.setdefault("quantity", "1")
        if "$total" in paymentInfoItem.get("amount", "0") or "$total" in paymentInfoItem.get("quantity", "0"):
            # Take care of this at the end.
            paymentInfoItemsWithTotal.append(paymentInfoItem)
            continue
        calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo)

    # Now take care of items for round off, etc. -- which need the total value to work.
    response_data["total"] = float(paymentInfo["total"])
    for paymentInfoItem in paymentInfoItemsWithTotal:
        calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo)
        if paymentInfoItem["couponCode"] and paymentInfoItem["amount"] * paymentInfoItem["quantity"] > 0:
            slots_requested = calculate_price(paymentInfoItem.get("count", "1"), response_data)
            slots_used = form.couponCodes_used.get(paymentInfoItem["couponCode"], 0)
            slots_remaining = slots_used - slots_requested
            if slots_remaining < 0:
                message = "Coupon code maximum reached.\nSubmitting this form will cause you to exceed the coupon code maximum.\nNumber of spots remaining: {}".format(slots_remaining)
                return {"res": {"success": False, "message": message, "fields_to_clear": ["couponCode"]}}
            form.couponCodes_used[paymentInfoItem["couponCode"]] = slots_used + slots_requested
            form.save()

    # Redeem coupon codes.
    #   if "couponCode" in response_data and response_data["couponCode"]:
    #       couponCode = response_data["couponCode"]
    #       if "couponCodes" in form and couponCode in form["couponCodes"]:
    #           coupon_paymentInfoItem = {
    #               "amount": form["couponCodes"][couponCode].get("amount", "0"),
    #               "quantity": form["couponCodes"][couponCode].get("quantity", "1"),
    #               "name": form["couponCodes"][couponCode].get("name", "Coupon Code"),
    #               "description": form["couponCodes"][couponCode].get("description", "Coupon Code")
    #           }
    #           calc_item_total_to_paymentInfo(coupon_paymentInfoItem, paymentInfo)
    #           paymentInfo['items'].append(coupon_paymentInfoItem)
    #       else:
    #           return {"res": {"success": False, "message": "Coupon Code not found.", "fields_to_clear": ["couponCode"]}}
    #       # verify max # of coupons:
    #       code_valid, code_num_remaining = coupon_code_verify_max_and_record_as_used(TABLES.forms, form, couponCode, responseId, response_data)
    #       if not code_valid:
    #           message = "Coupon code maximum reached.\nSubmitting this form will cause you to exceed the coupon code maximum.\nNumber of spots remaining: {}".format(code_num_remaining)
    #           return {"res": {"success": False, "message": message, "fields_to_clear": ["couponCode"]}}
    #   else:
    #       response_data.pop("couponCode", None)
    response_data.pop("total", None)

    paymentInfo['items'] = [item for item in paymentInfo['items'] if item['quantity'] * item['amount'] != 0]
    userId = app.get_current_user_id()
    paid = paymentInfo["total"] == 0
    if newResponse:
        response = Response(
            form=form,
            id=responseId,
            date_created=datetime.datetime.now(),
            modify_link=modify_link + "?responseId=" + str(responseId) if modify_link else ""
        )
        if get(form, "formOptions.loginRequired", False) is True and userId is not "cm:cognitoUserPool:anonymousUser":
            user = get_user_or_create_one(userId)
            response.user = userId
            # Only one response per user.
            try:
                Response.objects.get({"form": ObjectId(formId), "user": userId})
                raise Exception(f"Response with userId {userId} already exists!")
            except DoesNotExist:
                pass
    else:
        response = Response.objects.get({"_id": responseId})
        response.update_trail.append(UpdateTrailItem(
            old=response.value,
            new=response_data,
            date=datetime.datetime.now(),
            update_type="update"
        ))
        if (response.paid == True and paymentInfo["total"] <= response.paymentInfo["total"]):
            paid = True
        if form.id != response.form.id:
            raise UnauthorizedError(f"Response {response.id} does not belong to form {form.id}; it belongs to form {response.form.id}.")
        if response.user and response.user.id != userId:
            raise UnauthorizedError(f"User {userId} does not own response {response.id} (owner is {response.user.id})")
    if newResponse or (not newResponse and paid):
        response.value = response_data
        response.date_modified = datetime.datetime.now()
        response.paymentInfo = paymentInfo
        response.paid = paid
        if not newResponse:
            response.update_trail.append(UpdateTrailItem(date=datetime.datetime.now(), update_type="apply_update"))
        if paid and confirmationEmailInfo: # If total amount is zero (user uses coupon code to get for free)
            send_confirmation_email(response, confirmationEmailInfo)
            email_sent = True
        # todo: fix this, ccavenue currently does not work with the new cosmosdb form format.
        if "ccavenue" in paymentMethods: # todo: add this in update too.
            paymentMethods["ccavenue"] = update_ccavenue_hash(formId, paymentMethods["ccavenue"], form["center"], response)
        # todo: fix this, should auto_email come even if not paid?
        if "auto_email" in paymentMethods and get(paymentMethods, "auto_email.enabled", True) == True and type(get(paymentMethods, "autoEmail.confirmationEmailInfo") is dict):
            send_confirmation_email(response, get(paymentMethods, "auto_email.confirmationEmailInfo"))
            email_sent = True
        response.save()
        return {"res": {"paid": paid, "success": True, "action": "insert", "email_sent": email_sent, "responseId": str(responseId), "paymentInfo": paymentInfo, "paymentMethods": paymentMethods } }
    elif not newResponse:
        # Update.
        response.date_modified = datetime.datetime.now()
        # Not using pending_update for now.
        # response.pending_update = {
        #     "value": response_data,
        #     "paymentInfo": paymentInfo,
        # }
        response.value = response_data
        response.paymentInfo = paymentInfo
        response.paid = paid
        response.save()
        return {"res": {"paid": paid, "success": True, "action": "update", "email_sent": email_sent, "responseId": str(responseId), "paymentInfo": paymentInfo, "paymentMethods": paymentMethods, "amt_received": {"currency": paymentInfo["currency"], "total": float(response.amount_paid or 0) } } }