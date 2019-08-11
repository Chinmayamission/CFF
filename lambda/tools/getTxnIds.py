"""
pipenv run python -m unittest tools.getTxnIds
Gets all unique paypal transaction IDs.
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

os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
os.environ["MODE"] = "PROD"
os.environ["DB_NAME"] = "cff_prod" if PROD else "cff_beta"
os.environ["USER_POOL_ID"] = ""
os.environ["S3_UPLOADS_BUCKET_NAME"] = ""
os.environ["COGNITO_CLIENT_ID"] = ""
import csv

from chalicelib.main import app, MODE

print("MODE", MODE)
from chalicelib.models import (
    Response,
    Form,
    PaymentTrailItem,
    PaymentStatusDetailItem,
    serialize_model,
)

# sanity check -- no one is marked as "not paid" with a zero total.
# responses = Response.objects.raw({"form": ObjectId(formId), "paid": False, "paymentInfo.total": 0})
# responses = Response.objects.raw({"form": ObjectId(formId), "paid": False, "amount_paid": {"$ne": "0"} })
# print(list(responses))

paypal_ids = set()
id_to_row = {}

with open(os.path.join(os.path.dirname(__file__), "Download.CSV")) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        id = row["Transaction ID"]
        id_to_row[id] = row
        paypal_ids.add(id)

responses = Response.objects.raw({}).aggregate(
    {"$unwind": "payment_status_detail"},
    {"$match": {"payment_status_detail.method": "paypal_ipn"}},
    {"$project": {"payment_status_detail.id": 1}},
)
responses = list(responses)
ids = set()
ids_to_resp_ids = {}

ids = set(
    [
        r["payment_status_detail"]["id"]
        for r in responses
        if "id" in r["payment_status_detail"]
    ]
)
ids_to_resp_ids = {
    r["payment_status_detail"]["id"]: str(r["_id"])
    for r in responses
    if "id" in r["payment_status_detail"]
}

missed_ids = paypal_ids - ids

with open(os.path.join(os.path.dirname(__file__), "output.CSV"), "w+") as csvfile:
    fieldnames = [
        "Date",
        "Time",
        "TimeZone",
        "Name",
        "Type",
        "Status",
        "Currency",
        "Gross",
        "Fee",
        "Net",
        "From Email Address",
        "To Email Address",
        "Transaction ID",
        "Shipping Address",
        "Address Status",
        "Item Title",
        "Item ID",
        "Shipping and Handling Amount",
        "Insurance Amount",
        "Sales Tax",
        "Option 1 Name",
        "Option 1 Value",
        "Option 2 Name",
        "Option 2 Value",
        "Reference Txn ID",
        "Invoice Number",
        "Custom Number",
        "Quantity",
        "Receipt ID",
        "Balance",
        "Address Line 1",
        "Address Line 2/District/Neighborhood",
        "Town/City",
        "State/Province/Region/County/Territory/Prefecture/Republic",
        "Zip/Postal Code",
        "Country",
        "Contact Phone Number",
        "Subject",
        "Note",
        "Country Code",
        "Balance Impact",
    ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    # for id in missed_ids:
    #     writer.writerow(id_to_row[id])
    for id in missed_ids:
        print('"' + '","'.join([i for i in id_to_row[id].values()]) + '"')

# print(total)
# .objects.raw({"form": ObjectId(formId), "paid": True})
