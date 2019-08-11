"""
python tools/bulkEmail.py
python -m unittest tools.bibCheckDuplicates
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

used_bibs = []
duplicate_bibs = []
for rNum, response in enumerate(responses):
    print(f"=== Starting response number {rNum} ===")
    for i, participant in enumerate(get(response, "value.participants", [])):
        oldbib = str(get(participant, "bib_number"))
        if oldbib in used_bibs and oldbib != "None":
            duplicate_bibs.append(oldbib)
        used_bibs.append(oldbib)
print("Done! Duplicates:")
print(duplicate_bibs)
