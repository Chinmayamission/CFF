"""
pipenv run python -m unittest tools.bibNumber
Renames fields
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

formId = "" if PROD else "...."

os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
os.environ["MODE"] = "BETA"
os.environ["DB_NAME"] = "cff_prod" if PROD else "cff_beta"
os.environ["USER_POOL_ID"] = ""
os.environ["S3_UPLOADS_BUCKET_NAME"] = ""
os.environ["COGNITO_CLIENT_ID"] = ""

from chalicelib.main import app, MODE

print("MODE", MODE)
from chalicelib.models import (
    Response,
    Form,
    PaymentTrailItem,
    PaymentStatusDetailItem,
    serialize_model,
)

BIBS = {"5K": 5713, "10K": 10327, "Half Marathon": 105}

# sanity check -- no one is marked as "not paid" with a zero total.
# responses = Response.objects.raw({"form": ObjectId(formId), "paid": False, "paymentInfo.total": 0})
# responses = Response.objects.raw({"form": ObjectId(formId), "paid": False, "amount_paid": {"$ne": "0"} })
# print(list(responses))

responses = Response.objects.raw({"form": ObjectId(formId), "paid": True})


for response in responses:
    for participant in response.value.get("participants", []):
        race = participant["race"]
        if response.paid is True and race in BIBS and "bib_number" not in participant:
            BIBS[race] += 1
            print(response.id, race, BIBS[race])
            participant["bib_number"] = BIBS[race]
        else:
            pass
            # print("nope", response.id, response.paid, race)
    # response.save()

print(BIBS)
# {'5K': 5741, '10K': 10333, 'Half Marathon': 115}
"""
5K - 5001 - 5701
10K - 10001 - 10321
Half Marathon - 1 - 105
"""
