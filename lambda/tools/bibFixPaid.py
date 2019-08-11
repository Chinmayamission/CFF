"""
python tools/bulkEmail.py
python -m unittest tools.bibFixPaid
"""
from tests.integration.constants import _
from chalicelib.util.formSubmit.emailer import display_form_dict, email_to_html_text
import os

os.environ["TABLE_PREFIX"] = "cff_prod"
from chalicelib.main import TABLES
from chalicelib.util import get_all_responses
from boto3.dynamodb.conditions import Key
import boto3
import json
from pynliner import Pynliner
from pydash.objects import get
import datetime

formId = "31571110-483c-4b72-b4b8-5b1ce0b9348b"

client = boto3.client("ses")
responses = boto3.resource("dynamodb").Table("cff_prod.responses")

print("Querying all responses...")
responses = get_all_responses(
    KeyConditionExpression=Key("formId").eq(formId),
    FilterExpression=Key("PAID").eq(True),
)
print("Got responses.")

"""
5K: 5001-6000
10K: 10001-10400
HM: 1-200
"""
for rNum, response in enumerate(responses):
    # print(f"=== Starting response number {rNum} ===")
    if type(response["PAID"]) is not bool:
        print(response["responseId"], response["PAID"])
print("Done!")
