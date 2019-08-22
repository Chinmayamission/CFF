from chalicelib.models import (
    Response,
    Form,
    PaymentTrailItem,
    PaymentStatusDetailItem,
    serialize_model,
)
from chalicelib.main import app, MODE

"""
pipenv run python -m unittest tools.calculateTotals
Calculate totals.
"""
import os
import dateutil.parser
import boto3
import json
import datetime
from bson.objectid import ObjectId
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
from pydash.arrays import find_index

PROD = True

formId = "5c6b9b76780b47000197418f" if PROD else "...."

os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
os.environ["MODE"] = "BETA"
os.environ["DB_NAME"] = "cff_prod" if PROD else "cff_beta"
os.environ["USER_POOL_ID"] = ""
os.environ["S3_UPLOADS_BUCKET_NAME"] = ""
os.environ["COGNITO_CLIENT_ID"] = ""


print("MODE", MODE)

# sanity check -- no one is marked as "not paid" with a zero total.
# responses = Response.objects.raw({"form": ObjectId(formId), "paid": False, "paymentInfo.total": 0})
# responses = Response.objects.raw({"form": ObjectId(formId), "paid": False, "amount_paid": {"$ne": "0"} })
# print(list(responses))

responses = Response.objects.raw({"form": ObjectId(formId)}).aggregate(
    {"$unwind": "payment_status_detail"},
    {"$match": {"payment_status_detail.method": "paypal_ipn"}},
    {"$project": {"payment_status_detail.amount": 1}},
)

total = sum(float(item["payment_status_detail"]["amount"]) for item in responses)

print(total)
# .objects.raw({"form": ObjectId(formId), "paid": True})
