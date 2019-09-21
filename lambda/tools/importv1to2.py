"""
npm test -- tools.importv1to2
Imports responses from v1-type forms (cff.chinmayamission.com - dynamodb) to v2-type forms (forms.chinmayamission.com - cosmosdb)
"""

"""
IMPORT HISTORY
==============
earlier - moved responses from
"cd37f8f8-35d7-4e58-9811-116158af0a5f", "5c0d505ec440d10001404616" - academicians' form.

9/15/19 - moved responses from
"736f88ac-d528-41d8-8eba-eb46931b1da6", "5d7e71bf312b1c0001451596" - 2018 CMTC Color Walk
"4fd6adfd-d91d-4f76-ab47-2b744f016a01", "5d7e736c312b1c0001451597" - 2018 CMA Tej
"f548443-99da-4340-b825-3f09921b4ad5", "5d7ec75e337efe000147a612" - 2018 JMSM USD
"e206b290-9067-49f6-9464-1153fc59dc0e", "5d7ec831337efe000147a613" - 2018 JMSM INR

"5c243e61-5407-402b-a89b-5190c46d0d05", "5d7eccf103364b000150d43c" - 2018 CMSJ Om Run Individual Sponsorship Form
"31571110-483c-4b72-b4b8-5b1ce0b9348b", "5d7ece8503364b000150d43d" - 2018 OM Run Main Registration Form
"ffd0111c-4880-4891-9306-a052b86a4572", "5d7ecf1003364b000150d43e" - 2018 OM Run Premium Sponsorship Form
"e4548443-99da-4340-b825-3f09921b4ac4", "5d7ed0d403364b000150d43f" - 2018 OM Run Training Registration Form

# todo: add amount_paid column for imported responses.
# todo: fix date created.
# todo: add id to paymentstatusdetailitem. This will also let us account for duplicate transactions
"""

import os
import dateutil.parser
import boto3
import json
import datetime
from bson.objectid import ObjectId
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal

os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
os.environ["MODE"] = "PROD"
os.environ["DB_NAME"] = "cff_prod"
os.environ["USER_POOL_ID"] = "n/a"
os.environ["COGNITO_CLIENT_ID"] = "n/a"

from chalicelib.models import Response, Form, PaymentTrailItem, PaymentStatusDetailItem
from chalicelib.main import app, MODE


print("MODE", MODE)

table_responses = boto3.resource("dynamodb").Table("cff_prod.responses")
formIdOld, formIdNew = "", ""
formIdOld, formIdNew = (
    "e4548443-99da-4340-b825-3f09921b4ac4",
    "5d7ed0d403364b000150d43f",
)

query = table_responses.query(KeyConditionExpression=Key("formId").eq(formIdOld))


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


for response in query["Items"]:
    response = json.loads(json.dumps(response, cls=DecimalEncoder))
    if "PAYMENT_HISTORY" not in response and "IPN_STATUS" in response:
        # really-old-style responses:
        if response["IPN_STATUS"] != "Completed":
            print(
                "IPN_STATUS is not 'completed' for "
                + response["responseId"]
                + "; must be manually checked afterwards."
            )
        elif len(response["IPN_HISTORY"]) > 1:
            print(
                "Too many IPN_HISTORY values for response "
                + response["responseId"]
                + "; must be manually checked afterwards."
            )
        for ipn_history_item in response["IPN_HISTORY"]:
            ipn_history_item["status"] = "Success"
        response["PAYMENT_HISTORY"] = [
            {
                "date": i["date"],
                "amount": i["value"]["mc_gross"],
                "currency": i["value"]["mc_currency"],
                "method": "paypal",
            }
            for i in response["IPN_HISTORY"]
        ]
    PAYMENT_HISTORY = response.get("PAYMENT_HISTORY", [])
    IPN_HISTORY = response.get("IPN_HISTORY", [])
    res = Response(
        date_created=dateutil.parser.parse(response["date_created"]),
        date_modified=dateutil.parser.parse(response["date_last_modified"]),
        form=ObjectId(formIdNew),
        paymentInfo=response["paymentInfo"],
        value=response["value"],
        paid=response["PAID"],
        payment_trail=[
            PaymentTrailItem(
                date=dateutil.parser.parse(i["date"]),
                value=i["value"],
                status=i["status"],
                id=i["value"]["txn_id"],
                method="paypal_ipn",
            )
            if "txn_id" in i["value"]
            else PaymentTrailItem(
                date=dateutil.parser.parse(i["date"]),
                value=i["value"],
                status=i["status"],
                id=i["value"]["order_id"],
                method="ccavenue",
            )
            # todo: do we need to handle manual payments from v1?
            for i in response.get("IPN_HISTORY", [])
        ]
        or [],
        payment_status_detail=[
            PaymentStatusDetailItem(
                date=dateutil.parser.parse(i["date"]),
                amount=i["amount"],
                currency=i["currency"],
                method="paypal_ipn" if i["method"] == "paypal" else i["method"],
            )
            for i in PAYMENT_HISTORY
        ]
        or [],
    )
    res.amount_paid = str(
        float(sum(float(i.amount) for i in res.payment_status_detail))
    )
    res.save()
    print(res.id)
