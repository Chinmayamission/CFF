from chalicelib.models import Response, Form, PaymentTrailItem, PaymentStatusDetailItem
from chalicelib.main import app, MODE
"""
pipenv run python -m unittest tools.importv1to2
Imports v1-type forms (cff.chinmayamission.com - dynamodb) to v2-type forms (forms.chinmayamission.com - cosmosdb)
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


print("MODE", MODE)

table_responses = boto3.resource("dynamodb").Table("cff_prod.responses")
formIdOld = ""
formIdNew = ""

query = table_responses.query(
    KeyConditionExpression=Key("formId").eq(formIdOld))


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


for response in query["Items"]:
    response = json.loads(json.dumps(response, cls=DecimalEncoder))
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
            for i in response.get("PAYMENT_HISTORY", [])
        ]
        or [],
    )
    res.save()
