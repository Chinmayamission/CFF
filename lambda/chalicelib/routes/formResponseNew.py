import uuid
from chalice import UnauthorizedError
import datetime
from pydash.objects import pick, get, unset
from ..util.formSubmit.util import calculate_price
from ..util.formSubmit.couponCodes import coupon_code_verify_max_and_record_as_used
from ..util.formSubmit.emailer import send_confirmation_email, fill_string_from_template
from ..util.formSubmit.ccavenue import update_ccavenue_hash
from ..util.formSubmit.paymentMethods import fill_paymentMethods_with_data
from ..util.responseUploadImages import process_response_data_images
from chalicelib.util.patch import patch_predicate
from chalicelib.util.counter import get_counter
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

    form = Form.objects.get({"_id": ObjectId(formId)})
    response_data = app.current_request.json_body["data"]
    response_data = process_response_data_images(response_data)
    postprocess = form.formOptions.postprocess
    if (
        postprocess
        and "patches" in postprocess
        and type(postprocess["patches"]) is list
    ):
        response_data = patch_predicate(response_data, postprocess["patches"])
    counter_value = None
    counter = form.formOptions.counter
    if newResponse and counter and "enabled" in counter and counter["enabled"] == True:
        counter_value = get_counter(formId)
    modify_link = app.current_request.json_body.get("modifyLink", "")
    paymentInfo = form.formOptions.paymentInfo
    confirmationEmailInfo = form.formOptions.confirmationEmailInfo
    paymentMethods = fill_paymentMethods_with_data(
        form.formOptions.paymentMethods, response_data
    )

    def calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo):
        paymentInfoItem["amount"] = calculate_price(
            paymentInfoItem.get("amount", "0"), response_data
        )
        paymentInfoItem["quantity"] = calculate_price(
            paymentInfoItem.get("quantity", "0"), response_data
        )
        paymentInfoItem["total"] = (
            paymentInfoItem["amount"] * paymentInfoItem["quantity"]
        )
        paymentInfo["total"] += paymentInfoItem["total"]
        if (
            "couponCode" in paymentInfoItem
            and paymentInfoItem["amount"] * paymentInfoItem["quantity"] != 0
        ):
            slots_maximum = calculate_price(
                paymentInfoItem.get("couponCodeMaximum", "-1"), response_data
            )
            if slots_maximum != -1:
                slots_requested = calculate_price(
                    paymentInfoItem.get("couponCodeCount", "1"), response_data
                )
                slots_used = form.couponCodes_used.get(paymentInfoItem["couponCode"], 0)
                slots_available = slots_maximum - slots_used
                slots_remaining = slots_available - slots_requested
                if slots_remaining < 0:
                    message = "Coupon code maximum reached.\nSubmitting this form will cause you to exceed the coupon code maximum.\nNumber of spots remaining: {}".format(
                        int(slots_available)
                    )
                    return (
                        False,
                        {
                            "res": {
                                "success": False,
                                "message": message,
                                "fields_to_clear": ["couponCode"],
                            }
                        },
                    )
                form.couponCodes_used[paymentInfoItem["couponCode"]] = (
                    slots_used + slots_requested
                )
                Form.objects.raw({"_id": form.id}).update(
                    {
                        "$set": {
                            f"couponCodes_used.{paymentInfoItem['couponCode']}": slots_used
                            + slots_requested
                        }
                    }
                )
        return True, {}

    paymentInfoItemsWithTotal = []
    paymentInfoItemsInstallment = []
    paymentInfo["total"] = 0
    for paymentInfoItem in paymentInfo.setdefault("items", []):
        paymentInfoItem.setdefault("name", "Payment Item")
        paymentInfoItem.setdefault("description", "Payment Item")
        paymentInfoItem.setdefault("quantity", "1")
        if paymentInfoItem.get("installment", False) == True:
            # Don't count "installment" payments towards the total.
            paymentInfoItemsInstallment.append(paymentInfoItem)
            continue
        if "$total" in paymentInfoItem.get(
            "amount", "0"
        ) or "$total" in paymentInfoItem.get("quantity", "0"):
            # Take care of this at the end.
            paymentInfoItemsWithTotal.append(paymentInfoItem)
            continue
        success, error = calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo)
        if success is False:
            return error

    # Now take care of items for round off, etc. -- which need the total value to work.
    response_data["total"] = float(paymentInfo["total"])
    for paymentInfoItem in paymentInfoItemsWithTotal:
        success, error = calc_item_total_to_paymentInfo(paymentInfoItem, paymentInfo)
        if success is False:
            return error

    # Take care of installment payments now.
    response_data["total"] = float(paymentInfo["total"])
    for paymentInfoItem in paymentInfoItemsInstallment:
        paymentInfoItem["amount"] = calculate_price(
            paymentInfoItem.get("amount", "0"), response_data
        )
        paymentInfoItem["quantity"] = calculate_price(
            paymentInfoItem.get("quantity", "0"), response_data
        )
        if paymentInfoItem["recurrenceTimes"]:
            paymentInfoItem["total"] = (
                paymentInfoItem["amount"]
                * paymentInfoItem["quantity"]
                * int(paymentInfoItem["recurrenceTimes"])
            )
    response_data.pop("total", None)

    paymentInfo["items"] = [
        item for item in paymentInfo["items"] if item["quantity"] * item["amount"] != 0
    ]
    userId = app.get_current_user_id()
    paid = paymentInfo["total"] == 0
    if newResponse:
        response = Response(
            form=form,
            id=responseId,
            date_created=datetime.datetime.now(),
            modify_link=modify_link + "?responseId=" + str(responseId)
            if modify_link
            else "",
            counter=counter_value,
        )
        if (
            get(form, "formOptions.loginRequired", False) is True
            and userId is not "cm:cognitoUserPool:anonymousUser"
        ):
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
        response.update_trail.append(
            UpdateTrailItem(
                old=response.value,
                new=response_data,
                date=datetime.datetime.now(),
                update_type="update",
            )
        )
        if (
            response.paid == True
            and paymentInfo["total"] <= response.paymentInfo["total"]
        ):
            paid = True
        if form.id != response.form.id:
            raise UnauthorizedError(
                f"Response {response.id} does not belong to form {form.id}; it belongs to form {response.form.id}."
            )
        if response.user and response.user.id != userId:
            app.check_permissions(form, "Responses_Edit")
            # raise UnauthorizedError(f"User {userId} does not own response {response.id} (owner is {response.user.id})")
    if newResponse or (not newResponse and paid):
        response.value = response_data
        response.date_modified = datetime.datetime.now()
        response.paymentInfo = paymentInfo
        response.paid = paid
        if not newResponse:
            response.update_trail.append(
                UpdateTrailItem(
                    date=datetime.datetime.now(), update_type="apply_update"
                )
            )
        if (
            paid and confirmationEmailInfo
        ):  # If total amount is zero (user uses coupon code to get for free)
            send_confirmation_email(response, confirmationEmailInfo)
            email_sent = True
        # todo: fix this, should auto_email come even if not paid?
        if (
            "auto_email" in paymentMethods
            and get(paymentMethods, "auto_email.enabled", True) == True
            and type(get(paymentMethods, "autoEmail.confirmationEmailInfo") is dict)
        ):
            send_confirmation_email(
                response, get(paymentMethods, "auto_email.confirmationEmailInfo")
            )
            email_sent = True
        response.save()
        if "description" in paymentInfo and type(paymentInfo["description"]) is str:
            paymentInfo["description"] = fill_string_from_template(
                response, paymentInfo["description"]
            )
        if "currencyTemplate" in paymentInfo:
            paymentInfo["currency"] = fill_string_from_template(
                response, paymentInfo["currencyTemplate"]
            )
            del paymentInfo["currencyTemplate"]
        response.save()
        if "ccavenue" in paymentMethods and response.paid == False:
            paymentMethods["ccavenue"] = update_ccavenue_hash(
                formId, paymentMethods["ccavenue"], response
            )
        # todo: should we save response here?
        return {
            "res": {
                "value": response_data,
                "paid": paid,
                "success": True,
                "action": "insert",
                "email_sent": email_sent,
                "responseId": str(responseId),
                "paymentInfo": paymentInfo,
                "paymentMethods": paymentMethods,
            }
        }
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
        if "description" in paymentInfo and type(paymentInfo["description"]) is str:
            paymentInfo["description"] = fill_string_from_template(
                response, paymentInfo["description"]
            )
        if "ccavenue" in paymentMethods and response.paid == False:
            paymentMethods["ccavenue"] = update_ccavenue_hash(
                formId, paymentMethods["ccavenue"], response
            )
        return {
            "res": {
                "value": response_data,
                "paid": paid,
                "success": True,
                "action": "update",
                "email_sent": email_sent,
                "responseId": str(responseId),
                "paymentInfo": paymentInfo,
                "paymentMethods": paymentMethods,
                "amt_received": {
                    "currency": paymentInfo["currency"],
                    "total": float(response.amount_paid or 0),
                },
            }
        }
