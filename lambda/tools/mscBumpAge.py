"""
pipenv --python /Users/epicfaace/.pyenv/shims/python3.6  install
pipenv run python -m unittest tools.mscBumpAge > out
pipenv shell

Bumps ages and grades from MSC 2020 -> 2021.
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
import logging

os.environ["MODE"] = "PROD"
os.environ["DB_NAME"] = "cff_prod"
os.environ["USER_POOL_ID"] = ""
os.environ["COGNITO_CLIENT_ID"] = ""

from chalicelib.main import app, MODE
from chalicelib.models import Response, Form


grades = ["KG and below", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

responses = Response.objects.raw({"form": ObjectId("5c96811ed0443d00011255d5")})
# print(len(responses))
# for response in responses:
#   print("res")

for response in responses:
    for participant in response.value.get("participants", []):
        output = f"{response.id}: {participant['name']['first']} {participant['name']['last']}"
        if "age" in participant:
            age = participant["age"]
            new_age = age + 1
            output += f", age {age}->{new_age}"
            participant["age"] = new_age
        if "grade" in participant:
            idx = grades.index(participant["grade"])
            grade = participant["grade"]
            if grade == "12":
                new_grade = None
                del participant["grade"]
                output += f", grade {grade}->{new_grade}"
            elif grade == "KG and below":
                output += f", grade {grade}->{grade}"
            else:
                new_grade = grades[idx + 1]
                output += f", grade {grade}->{new_grade}"
                participant["grade"] = new_grade
        print(output)
    # response.save()
