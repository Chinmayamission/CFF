"""
npm test -- tools.addPaymentFields
Add amount_owed_cents and amount_paid_cents to all fields.
"""
import os
os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
os.environ["MODE"] = "BETA"
os.environ["DB_NAME"] = "cff_beta"
os.environ["USER_POOL_ID"] = ""
os.environ["COGNITO_CLIENT_ID"] = ""
from chalicelib.models import (
    Response,
    Form,
    PaymentTrailItem,
    PaymentStatusDetailItem,
    serialize_model,
)
from chalicelib.main import app, MODE


import dateutil.parser
import boto3
import json
import datetime
from bson.objectid import ObjectId
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal
from pydash.arrays import find_index


print("MODE", MODE)

# responses = Response.objects.raw({"form": ObjectId("5b3b4e7fb1117c0001c138ed")})
responses = Response.objects.raw({})

for response in responses:
    modified = False
    paymentInfo = response.paymentInfo
    amount_paid = response.amount_paid
    if paymentInfo and "total" in paymentInfo:
        modified = True
        response.amount_owed_cents = int(100 * paymentInfo["total"])
    if amount_paid:
        response.amount_paid_cents = int(100 * float(amount_paid))
    if modified:
        response.save()
        print("modified response " + str(response.id))