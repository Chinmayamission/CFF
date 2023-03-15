"""
pipenv run python -m unittest tools.deleteAll
Deletes all responses for a particular form.
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

os.environ["MODE"] = "PROD"
os.environ["DB_NAME"] = "cff_prod" if PROD else "cff_beta"
os.environ["USER_POOL_ID"] = ""
os.environ["S3_UPLOADS_BUCKET_NAME"] = ""
os.environ["COGNITO_CLIENT_ID"] = ""

from chalicelib.models import (
    Response,
    Form,
    PaymentTrailItem,
    PaymentStatusDetailItem,
    serialize_model,
)
from chalicelib.main import app, MODE

formId = "6255723a0435df8bab9961fe" if PROD else "...."


print("MODE", MODE)

responses = Response.objects.raw({"form": ObjectId("")})

# responses = Response.objects.raw({})

# print(len(list(responses)))

for response in responses:
    response.delete()
