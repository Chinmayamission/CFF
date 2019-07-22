"""
pipenv run python -m unittest tools.lowercaseUsers
Lowercases users
"""
import os
import dateutil.parser
import boto3
import json
import datetime
import time

# os.environ["AWS_PROFILE"] = "ashwin-cff-lambda"
# os.environ["MODE"] = "PROD"

TEST = True
client = boto3.client("cognito-idp")
# pool = "us-east-1_U9ls8R6E3" # beta
pool = "us-east-1_kcpcLxLzn" # prod

def do_stuff():
    i = 1
    emails = set()
    print(f"TEST IS {TEST}")
    paginationToken = None
    first = True
    while first or paginationToken:
        first = False
        if paginationToken:
            response = client.list_users(UserPoolId=pool, AttributesToGet=["email", "email_verified"], PaginationToken=paginationToken)
        else:
            response = client.list_users(UserPoolId=pool, AttributesToGet=["email", "email_verified"])
        paginationToken = response.get("PaginationToken", None)
        users = response["Users"]
        print(f"PG token {paginationToken}")
        for userObj in users:
            user = userObj["Username"]
            attributes = userObj["Attributes"]

            email = None
            email_verified = None
            for attribute in attributes:
                if attribute["Name"] == "email":
                    email = attribute["Value"]
                if attribute["Name"] == "email_verified":
                    email_verified = attribute["Value"]
            # continue
            if email == None or email_verified == None:
                raise Exception(f"Email or email verified is none for {user}")

            if email != email.lower():
                print(f"{i}. Changing email from {email} to {email.lower()}. Email verified is {email_verified}")
                if not TEST:
                    client.admin_update_user_attributes(
                        UserPoolId=pool,
                        Username=user,
                        UserAttributes=[
                            {
                                'Name': 'email',
                                'Value': email.lower()
                            },
                            {
                                'Name': 'email_verified',
                                'Value': email_verified
                            }
                        ]
                    )
            else:
                print(f"{i}. Email {email} is already good.")
            i += 1
    return emails

res = do_stuff()