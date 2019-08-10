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

formId = "" if PROD else "...."

os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
os.environ["MODE"] = "PROD"
os.environ["DB_NAME"] = "cff_prod" if PROD else "cff_beta"
os.environ["USER_POOL_ID"] = ""
os.environ["S3_UPLOADS_BUCKET_NAME"] = ""
os.environ["COGNITO_CLIENT_ID"] = ""

from chalicelib.main import app, MODE
print("MODE", MODE)
from chalicelib.models import Response, Form, PaymentTrailItem, PaymentStatusDetailItem, serialize_model

responses = Response.objects.raw({"form": ObjectId(formId)})

for response in responses:
    response.delete()