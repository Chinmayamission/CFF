import os
import boto3
from botocore.exceptions import ClientError
# import bleach
import html2text
from pynliner import Pynliner
from .util import format_paymentInfo, format_payment, display_form_dict, human_readable_key
from pydash.objects import get
import logging
from jinja2 import Environment, Undefined
import flatdict
from chalicelib.models import serialize_model

ccmt_email_css = """
table {
    border: 1px dashed black;
}
table th {
    text-transform: capitalize;
}
table th, table td {
    padding: 5px;
}
ul {
    list-style-type: none;
    padding: 0;
}
img.mainImage {
    max-width: 50%;
    float: right;
    margin: 20px;
}
"""

class SilentUndefined(Undefined):
    def _fail_with_undefined_error(self, *args, **kwargs):
        return ''

env = Environment(undefined=SilentUndefined)
env.filters['format_payment'] = format_payment

def human_readable(input):
    return input.upper()

# env.filters['upperstring'] = upperstring

def create_confirmation_email_dict(response, confirmationEmailInfo):
    # Creates dict with confirmation email info.
    if not confirmationEmailInfo: return
    if "template" in confirmationEmailInfo:
        templateText = get(confirmationEmailInfo, "template.html")
        flat = flatdict.FlatterDict(response.value)
        for i in flat:
            flat[human_readable_key(i)] = flat.pop(i)
        kwargs = dict(serialize_model(response), response=flat)
        msgBody = env.from_string(templateText).render(**kwargs)
        addCSS = False
    else:
        msgBody = ""
        if "contentHeader" in confirmationEmailInfo:
            msgBody += confirmationEmailInfo["contentHeader"]
        msgBody += "<h1>{}</h1>".format(confirmationEmailInfo.get("subject", "") or confirmationEmailInfo.get("header", "") or "Confirmation Email")
        if "image" in confirmationEmailInfo:
            msgBody += "<img class='mainImage' src='{}' />".format(confirmationEmailInfo["image"])
        msgBody += confirmationEmailInfo.get("message", "")
        if confirmationEmailInfo["showResponse"]:
            msgBody += "<br><br>" + display_form_dict(response.value, confirmationEmailInfo.get("responseTableOptions", {}))
        
        if 'items' in response.paymentInfo and len(response.paymentInfo['items']) > 0:
            msgBody += "<br><br><table class=paymentInfoTable>"
            msgBody += "<tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr>"
            for paymentInfoItem in response.paymentInfo['items']:
                msgBody += "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>".format(
                    paymentInfoItem.get('name',''),
                    paymentInfoItem.get('description',''),
                    format_payment(paymentInfoItem.get('amount',''), get(response, 'paymentInfo.currency', 'USD')),
                    paymentInfoItem.get('quantity','')
                )
            msgBody += "</table>"
        
        totalAmountText = confirmationEmailInfo.get("totalAmountText", "Total Amount")
        msgBody += "<br><br><h2>{}: {}</h2>".format(totalAmountText, format_paymentInfo(response.paymentInfo))
        if confirmationEmailInfo.get("showModifyLink", False) and hasattr(response, "modifyLink"):
            msgBody += "<br><br>Modify your response by going to this link: {}#responseId={}".format(confirmationEmailInfo.get("modifyLink", response.modifyLink), str(response["_id"]["$oid"]))
        msgBody += confirmationEmailInfo.get("contentFooter", "")
        # todo: check amounts and Completed status, and then send.
        addCSS = True
    
    toField = confirmationEmailInfo["toField"]
    if type(toField) is not list:
        toField = [toField]

    kwargs = dict(toEmail=[get(response.value, i) for i in toField],
                        fromEmail=confirmationEmailInfo.get("from", "webmaster@chinmayamission.com"),
                        fromName=confirmationEmailInfo.get("fromName", "Webmaster"),
                        subject=confirmationEmailInfo.get("subject", "Confirmation Email"),
                        bccEmail=confirmationEmailInfo.get("bcc", ""),
                        ccEmail=confirmationEmailInfo.get("cc", ""),
                        msgBody=msgBody,
                        addCSS=addCSS
                        )
    return kwargs

def email_to_html_text(msgBody, addCSS):
    BODY_TEXT = html2text.html2text(msgBody)
    # The HTML body of the email.
    if addCSS:
        BODY_HTML = Pynliner().from_string(msgBody).with_cssString(ccmt_email_css).run()
    else:
        BODY_HTML = Pynliner().from_string(msgBody).run() # bleach.linkify(bleach.clean(msgBody))
    return BODY_TEXT, BODY_HTML

def send_email(
    toEmail="aramaswamis@gmail.com",
    fromEmail="webmaster@chinmayamission.com",
    ccEmail="",
    bccEmail="",
    fromName="Webmaster",
    subject="Confirmation email",
    msgBody="<h1>Confirmation</h1><br><p>Thank you for registering.</p>",
    addCSS=False
    ):
    # Replace sender@example.com with your "From" address.
    # This address must be verified with Amazon SES.
    SENDER = "{} <{}>".format(fromName, fromEmail)
    # If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
    AWS_REGION = "us-east-1"
    BODY_TEXT, BODY_HTML = email_to_html_text(msgBody, addCSS)
    # The character encoding for the email.
    CHARSET = "utf-8"
    client = boto3.client('ses',region_name=AWS_REGION)

    if toEmail and type(toEmail) is str: toEmail = toEmail.split(",")
    if ccEmail and type(ccEmail) is str: ccEmail = ccEmail.split(",")
    if bccEmail and type(bccEmail) is str: bccEmail = bccEmail.split(",")
    toEmail = [email for email in toEmail if email] if toEmail else []
    ccEmail = [email for email in ccEmail if email] if ccEmail else []
    bccEmail = [email for email in bccEmail if email] if bccEmail else []

    try:
        response = client.send_email(
            Source=SENDER,
            Destination={
                'ToAddresses': toEmail,
                'CcAddresses': ccEmail,
                'BccAddresses': bccEmail
            },
            Message={
                'Subject': {
                    'Data': subject,
                    'Charset': CHARSET
                },
                'Body': {
                    'Text': {
                        'Data': BODY_TEXT,
                        'Charset': CHARSET
                    },
                    'Html': {
                        'Data': BODY_HTML,
                        'Charset': CHARSET
                    }
                }
            },
            # ReplyToAddresses=[
            #     'string',
            # ],
            # ReturnPath='aramaswamis@gmail.com',
            # SourceArn='string',
            # ReturnPathArn='string',
            # Tags=[
            #     {
            #         'Name': 'string',
            #         'Value': 'string'
            #     },
            # ],
            # ConfigurationSetName='string'
        )
    # Display an error if something goes wrong.
    except ClientError as e:
        print('Error sending email to {}. Error message: {}'.format(toEmail, e.response['Error']['Message']))
        raise
    else:
        print('Email sent successfully to {}.'.format(toEmail))

def send_confirmation_email(response, confirmationEmailInfo):
    """ Actually send confirmation email"""
    dct = create_confirmation_email_dict(response, confirmationEmailInfo)
    send_email(**dct)
    return dct