"""
pipenv run python -m unittest tools.renameField
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

os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
os.environ["MODE"] = "PROD"
os.environ["DB_NAME"] = "cff_prod"
os.environ["USER_POOL_ID"] = ""
os.environ["COGNITO_CLIENT_ID"] = ""

from chalicelib.main import app, MODE
print("MODE", MODE)
from chalicelib.models import Response, Form, PaymentTrailItem, PaymentStatusDetailItem, serialize_model

responses = Response.objects.raw({"form": ObjectId("5b3ce38b3301e700010eacbc")})
for response in responses:
  if response.value["parivar"] == True:
    response.value["membership_type"] = "parivar_monthly"
  elif response.value["parivar"] == False:
    response.value["membership_type"] = "basic"
  del response.value["parivar"]
  response.save()