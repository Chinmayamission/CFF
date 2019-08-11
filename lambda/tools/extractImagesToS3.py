"""
pipenv run python -m unittest tools.extractImagesToS3
Extracts images and puts them in S3.
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
import hashlib
import base64
import re

os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
os.environ["MODE"] = "PROD"
os.environ["DB_NAME"] = "cff_prod"
os.environ["USER_POOL_ID"] = ""
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


TEST = True
# Response.objects.get({"_id": ObjectId("5b4227064a05180001b5aa89")}).delete()
responses = Response.objects.raw({"form": ObjectId("")})

s3_client = boto3.client("s3")


def fix_data():
    for response in responses:
        if "images" in response.value:
            for i, image in enumerate(response.value["images"]):
                if image.startswith("data:"):
                    content_type = re.findall("^data:([^;]+);", image)[0]
                    content = re.sub("^.*?base64,", "", image)
                    name = hashlib.md5(image.encode("utf-8")).hexdigest()
                    print("Base 64 image " + name)
                    s3_client.put_object(
                        Bucket="cff-uploads-prod",
                        Body=base64.b64decode(content),
                        Key=name,
                        ContentType=content_type,
                        ContentEncoding="base64",
                    )
                    response.value["images"][i] = name
                    response.save()


fix_data()
