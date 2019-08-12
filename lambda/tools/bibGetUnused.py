import datetime
from pydash.objects import get
from pynliner import Pynliner
import json
import boto3
from boto3.dynamodb.conditions import Key
from chalicelib.util import get_all_responses
from chalicelib.main import TABLES
"""
python tools/bulkEmail.py
python -m unittest tools.bibGetUnused
"""
from tests.integration.constants import _
from chalicelib.util.formSubmit.emailer import display_form_dict, email_to_html_text
import os

os.environ["TABLE_PREFIX"] = "cff_prod"

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
unused_bibs = set(
    [
        str(x)
        for x in list(range(1, 201))
        + list(range(5001, 6001))
        + list(range(10001, 10401))
    ]
)
for rNum, response in enumerate(responses):
    print(f"=== Starting response number {rNum} ===")
    for i, participant in enumerate(get(response, "value.participants", [])):
        bib = str(get(participant, "bib_number"))
        if bib in unused_bibs:
            unused_bibs.remove(bib)
            print(f"Removing bib {bib}...")
print("Done! Unused bibs:")
print("\n".join(sorted(unused_bibs, key=float)))
