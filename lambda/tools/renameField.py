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
from chalicelib.routes.formResponseList import _search

print("MODE", MODE)

import time

start = time.time()
form = Form.objects.only("formOptions", "cff_permissions").get({"_id": ObjectId("...")})
results = _search(form, "test", None, None, None)
print(time.time() - start)
print(results)

# for response in responses:
#     response.value["decided"] = "decided"
#     print(response.id)
#     response.save()
