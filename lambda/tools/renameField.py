"""
MODE=PROD AWS_PROFILE=default pipenv run python -m unittest tools.renameField
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

os.environ["AWS_PROFILE"] = "default"
os.environ["MODE"] = "PROD"
os.environ["DB_NAME"] = "cff_prod"
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

print("MODE", MODE)

responses = Response.objects.raw({"form": ObjectId("5c96811ed0443d00011255d5")})
# print(len(responses))
# for response in responses:
#   print("res")

for response in responses:
    response.value["decided"] = "decided"
    print(response.id)
    response.save()
