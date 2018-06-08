from .util import calculate_price
# def coupon_code_verify_max(form, code, responseId=None):
#     # True: coupon code can be used (either length of coupon codes used is not at max, or your ID has already used the coupon code before.)
#     # If maximum is negative, that means there is no maximum.
#     countByName = form.get("couponCodes", {}).get(code, {}).get("countBy", "responses")
#     usedDict = form.get("couponCodes_used", {}).get(code, {}).get(countByName, {})
#     # usedDict looks like: {"responseid1": 1, "responseid2": 3}
#     if (type(usedDict) is list): usedDict = {rid: 1 for rid in usedDict} # Backwards compatibility -- list.
#     totalNumUsed = sum(usedDict.values())

#     maximum = form.get("couponCodes", {}).get(code, {}).get("max", -1)
#     return responseId in usedDict or maximum < 0 or totalNumUsed < maximum

def coupon_code_verify_max_and_record_as_used(formsCollection, form, code, responseId, response_data):
    """
    countByName - which column to count coupons used by, i.e., "responses" or "participants", etc.
    response_data - data in the form.

    Returns:
    True/False: is coupon code valid?
    numRemaining: number of spots left for coupon codes (used in error messages)
    """
    # form = formsCollection.get_item(Key=formKey)["Item"]
    formKey = {"id": form['id'], "version": int(form['version'])}
    countByName = form.get("couponCodes", {}).get(code, {}).get("countBy", "responses")
    usedDict = form.get("couponCodes_used", {}).get(code, {}).get(countByName, {})
    shouldOverwriteList = False
    if (type(usedDict) is list):
        usedDict = {rid: 1 for rid in usedDict}
        shouldOverwriteList = True
    if countByName == "responses":
        number = 1
    else:
        number = int(calculate_price(countByName, response_data)) # todo: should this be turned into a decimal?
    
    totalNumUsed = sum(usedDict.values())
    maximum = form.get("couponCodes", {}).get(code, {}).get("max", -1)
    numRemaining = maximum - (totalNumUsed - usedDict.get("responseId", 0))
    if maximum >= 0 and numRemaining - number < 0:
        return False, numRemaining

    if usedDict.get(responseId, -1) == number:
        # Number did not change. Coupon code can be used, but no need to update it.
        return True, numRemaining - number
    else:
        usedDict[responseId] = number

    if "couponCodes_used" in form:
        if not shouldOverwriteList and code in form["couponCodes_used"] and countByName in form["couponCodes_used"][code]:
            formsCollection.update_item(
                Key = formKey,
                UpdateExpression="SET couponCodes_used.#code.#countByName.#responseId = :number",
                ExpressionAttributeNames={
                    "#code": code,
                    "#countByName": countByName,
                    "#responseId": responseId
                },
                ExpressionAttributeValues = {
                    ":number": number
                }
            )
        else:
            formsCollection.update_item(
                Key = formKey,
                UpdateExpression="SET couponCodes_used.#code = :couponCodeValue",
                ExpressionAttributeNames={
                    "#code": code
                },
                ExpressionAttributeValues = {
                    ":couponCodeValue": {countByName: usedDict}
                }
            )
    else:
        formsCollection.update_item(
            Key = formKey,
            UpdateExpression="SET couponCodes_used = :couponCodes_used",
            ExpressionAttributeValues = {
                ":couponCodes_used": {code: {countByName: usedDict} }
            }
        )
    return True, numRemaining - number