"""
npm run test tools.disambiguate

Disambiguates center values so that they can be grouped together.
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

os.environ["AWS_PROFILE"] = "cff"
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

MAP = {
    "Sanjose": "San Jose"
}

for response in responses:
    if "center" not in response.value:
        continue
    old_center = response.value["center"]
    center = old_center
    center = center.replace(", CA", "").replace(" CA", "").strip().title().replace("  "," ").replace("Chinmaya Mission ", "").replace("Chinmaya ", "")
    if center in MAP:
        center = MAP[center]
    center = center.strip()
    if center != old_center:
        response.value["center"] = center
        response.save()
        print("old: <" + old_center + ">, new: <" + center + ">")
