from chalicelib.models import Response, serialize_model
import app

"""
AWS_PROFILE=default pipenv run python -m unittest tools.findDeletedUsers
Lowercases users
"""
import os
import dateutil.parser
import boto3
import json
import datetime
import time

import pymongo
from tqdm import tqdm


TEST = False
client = boto3.client("cognito-idp")
# pool = "us-east-1_U9ls8R6E3" # beta
pool = "us-east-1_kcpcLxLzn"  # prod

# os.environ["AWS_PROFILE"] = "default"
os.environ["MODE"] = "PROD"
os.environ["USER_POOL_ID"] = pool
os.environ["COGNITO_CLIENT_ID"] = ""
os.environ["DB_NAME"] = "cff_prod"


def do_stuff():
    i = 1
    subs = []
    first = True
    paginationToken = None
    while first or paginationToken:
        first = False
        if paginationToken:
            response = client.list_users(
                UserPoolId=pool,
                AttributesToGet=["email", "email_verified"],
                PaginationToken=paginationToken,
            )
        else:
            response = client.list_users(
                UserPoolId=pool, AttributesToGet=["email", "email_verified"]
            )
        subs += [u["Username"] for u in response["Users"]]
        paginationToken = response.get("PaginationToken", None)
    print(subs)
    response = Response.objects.raw({"user": {"$exists": 1}}).project({"user": 1})
    for r in response:
        _, user = r.user.split("cm:cognitoUserPool:")
        if user not in subs:
            print("NO!!! ", user, serialize_model(r))
        # print("OK")
        pass
    # return emails


res = do_stuff()
