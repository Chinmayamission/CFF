from pynliner import Pynliner
import json
import boto3
from boto3.dynamodb.conditions import Key
from chalicelib.util import get_all_responses
from chalicelib.main import TABLES
"""
python tools/bulkEmail.py
python -m unittest tools.bulkEmail
"""
from tests.integration.constants import _
from chalicelib.util.formSubmit.emailer import display_form_dict, email_to_html_text
import os

os.environ["TABLE_PREFIX"] = "cff_prod"

CONFIRMATION_EMAIL_INFO = {
    "cc": None,
    "image": "http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png",
    "showResponse": False,
    "modifyLink": "onions",
    "showModifyLink": True,
    "subject": "CFF Unit Testing Form\n Confirmation",
    "toField": "email",
    "fromName": "Test",
    "from": "ccmt.dev@gmail.com",
    "message": "Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.",
}

TO_EMAIL = "success@simulator.amazonses.com"

EMAIL_CONTENT = """
Welcome to Om Run 2018!  For your safety and enjoyment please take the time to review race details <a href="https://omrun.cmsj.org/race-details/">here</a> and FAQ <a href="https://omrun.cmsj.org/race-faq/">here</a>.
Race bib, goody bag and shirt pick up information below:<br><br>
<a href="https://goo.gl/maps/qNUrgs6nF3x" style="box-sizing:border-box;margin:0px;padding:0px;border:0px;outline:0px;vertical-align:baseline;color:rgb(46,163,242);text-decoration:none;background-position:0px 0px">
  <strong>Sports Basement, Sunnyvale:</strong> 1177 Kern Ave., Sunnyvale
</a>
<br><br>
<ul>
<li>May 4: 5pm to 8pm</li>
<li>May 5: 1pm to 5pm</li>
</ul>
<a href="https://goo.gl/maps/bDkYfTJL89E2" style="box-sizing:border-box;margin:0px;padding:0px;border:0px;outline:0px;vertical-align:baseline;color:rgb(46,163,242);text-decoration:none;background-position:0px 0px">
  <strong>Sports Basement, San Ramon:</strong> 1041 Market Place, San Ramon, CA 94583  
</a><br><br>
<ul><li>May 5: 9am to 12pm</li></ul>
Thank you for attending the 8th edition of Om Run, have a safe and fun Om Run!
<br><br>
Team Om Run
<br><br>
Here is your race information:
"""

formId = "31571110-483c-4b72-b4b8-5b1ce0b9348b"
responseId = "aa5ac26d-42bf-4000-b71f-7cb3d12f2fc0"

client = boto3.client("ses")
responses = boto3.resource("dynamodb").Table("cff_prod.responses")

template = {
    "TemplateName": "Basic",
    "SubjectPart": "{{subject}}",
    "TextPart": "{{body_text}}",
    "HtmlPart": "{{body_html}}",
}
try:
    client.create_template(Template=template)
    print("Created template {}.".format(template["TemplateName"]))
except client.exceptions.AlreadyExistsException:
    client.update_template(Template=template)
    print("Updated template {}.".format(template["TemplateName"]))

print("Querying all responses...")
responses = get_all_responses(
    KeyConditionExpression=Key("formId").eq(formId),
    FilterExpression=Key("PAID").eq(True),
)
print("Got responses.")
response = responses[0]
EMAIL_CONTENT += "<h2>Your lookup ID: <strong>{}</strong></h2><br><br>{}".format(
    response["responseId"][:6], display_form_dict(response["value"])
)
BODY_TEXT, BODY_HTML = email_to_html_text(EMAIL_CONTENT)
recipient = "success@simulator.amazonses.com"
response = client.send_bulk_templated_email(
    Source="omrun@cmsj.org",
    Template="Basic",
    DefaultTemplateData=json.dumps(
        {
            "subject": "Om Run Final Information Email",
            "body_text": "Error",
            "body_html": "Error",
        }
    ),
    Destinations=[
        {
            "Destination": {"ToAddresses": [recipient]},
            "ReplacementTemplateData": json.dumps(
                {
                    "subject": "Om Run Final Information Email",
                    "body_text": BODY_TEXT,
                    "body_html": BODY_HTML,
                }
            ),
        }
    ],
)
print("Sent email to {}".format(recipient))
