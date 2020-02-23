from chalicelib.models import (
    Response,
    Form,
    PaymentTrailItem,
    PaymentStatusDetailItem,
    serialize_model,
)
from chalicelib.main import app, MODE

"""
pipenv run python -m unittest tools.fixSpuriousPayments
Removes spurious payments caused by incorrect initialization of lists (problem itself fixed by v2.1.6).
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


print("MODE", MODE)


TEST = True
# Response.objects.get({"_id": ObjectId("5b4227064a05180001b5aa89")}).delete()
responses = list(Response.objects.raw({}))


def fix_data():
    for response in responses:
        indexes_to_delete = []
        i = 0
        for item in response.payment_trail:
            idx_payment_trail = 0
            idx_payment_status_detail = 0
            if item.method == "paypal_ipn" and item.value["custom"] != str(response.id):
                if item.status != "SUCCESS":
                    indexes_to_delete.append([i])
                    continue
                print("Doing it...")
                idx_payment_trail = i

                # Find the associated payment_status_detail item.
                idx_payment_status_detail = find_index(
                    response.payment_status_detail, lambda x: x.date == item.date
                )
                if idx_payment_status_detail == -1:
                    idx_payment_status_detail = find_index(
                        response.payment_status_detail,
                        lambda x: (x.date - item.date).total_seconds() < 0.1,
                    )
                    print(
                        item.date,
                        response.payment_status_detail,
                        serialize_model(response),
                    )
                assert idx_payment_status_detail != -1
                payment_status_detail_item = response.payment_status_detail[
                    idx_payment_status_detail
                ]
                print("old", len(response.payment_status_detail))
                assert payment_status_detail_item.method == "paypal_ipn"
                assert payment_status_detail_item.amount == str(item.value["mc_gross"])
                assert (
                    payment_status_detail_item.id == None
                    or payment_status_detail_item.id == item.value["txn_id"]
                )

                assert (
                    Response.objects.raw(
                        {
                            "payment_trail": {
                                "$elemMatch": {"value.txn_id": item.value["txn_id"]}
                            }
                        }
                    ).count()
                    > 1
                )
                if response.paid == True and response.paymentInfo.get("total", 0) > 0:
                    assert len(response.payment_trail) > 1
                indexes_to_delete.append([idx_payment_trail, idx_payment_status_detail])
                print("new", len(response.payment_status_detail))

            i += 1
        print("indexes to delete", indexes_to_delete)
        for item in indexes_to_delete:
            del response.payment_trail[item[0]]
            if len(item) > 1:
                del response.payment_status_detail[item[1]]
        if not TEST:
            response.save()
        # break


def fix_txn_ids():
    for response in responses:
        response.email_trail = []
        response.update_trail = []
        for item in response.payment_trail:
            if item.method == "paypal_ipn" and item.status == "SUCCESS":
                # Find the associated payment_status_detail item.
                idx_payment_status_detail = find_index(
                    response.payment_status_detail, lambda x: x.date == item.date
                )
                if idx_payment_status_detail == -1:
                    idx_payment_status_detail = find_index(
                        response.payment_status_detail,
                        lambda x: (x.date - item.date).total_seconds() < 0.1,
                    )
                    print(item.date, response.payment_status_detail)
                assert idx_payment_status_detail != -1
                payment_status_detail_item = response.payment_status_detail[
                    idx_payment_status_detail
                ]
                assert payment_status_detail_item.method == "paypal_ipn"
                assert payment_status_detail_item.amount == str(item.value["mc_gross"])

                if payment_status_detail_item.id == None:
                    payment_status_detail_item.id = item.value["txn_id"]
        if not TEST:
            response.save()

        # update_trail
        # payment_trail
        # email_trail
        # payment_status_detail


with open("input-prod.txt", "w+") as file:
    file.writelines(
        [
            json.dumps(serialize_model(response), indent=4, sort_keys=True) + "\n"
            for response in responses
        ]
    )

fix_data()
fix_txn_ids()

with open("output-prod.txt", "w+") as file:
    file.writelines(
        [
            json.dumps(serialize_model(response), indent=4, sort_keys=True) + "\n"
            for response in responses
        ]
    )

if not TEST:
    responses = Response.objects.raw({})

# Check to make sure everything is ok!
for response in responses:
    assert (
        str(sum(float(item.amount) for item in response.payment_status_detail))
        >= response.amount_paid
        or response.paid == False
    )
