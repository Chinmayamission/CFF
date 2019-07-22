import os
import boto3
from botocore.exceptions import ClientError
# import bleach
import html2text
from pynliner import Pynliner
from .util import format_paymentInfo, format_payment, format_date, display_form_dict, human_readable_key
from pydash.objects import get
import logging
from jinja2 import Environment, Undefined
import flatdict
from chalicelib.models import serialize_model, EmailTrailItem
import datetime

class SilentUndefined(Undefined):
    def _fail_with_undefined_error(self, *args, **kwargs):
        return ''

env = Environment(undefined=SilentUndefined)
env.filters['format_payment'] = format_payment
env.filters['format_date'] = format_date

def human_readable(input):
    return input.upper()

# env.filters['upperstring'] = upperstring

def fill_string_from_template(response, templateText):
    flat = flatdict.FlatterDict(response.value)
    for i in flat:
        flat[human_readable_key(i)] = flat.pop(i)
    kwargs = dict(serialize_model(response), response=flat)
    if kwargs.get("modify_link", None):
        kwargs["view_link"] = kwargs["modify_link"] + "&mode=view"
    msgBody = env.from_string(templateText).render(**kwargs)
    return msgBody

def create_confirmation_email_dict(response, confirmationEmailInfo):
    # Creates dict with confirmation email info.
    if not confirmationEmailInfo: return
    templateText = get(confirmationEmailInfo, "template.html", "Confirmation Email Sample Text")
    msgBody = fill_string_from_template(response, templateText)
    addCSS = False
    
    toField = confirmationEmailInfo["toField"]
    if type(toField) is not list:
        toField = [toField]

    emailOptions = dict(toEmail=[get(response.value, i) for i in toField],
                        fromEmail=confirmationEmailInfo.get("from", "webmaster@chinmayamission.com"),
                        fromName=confirmationEmailInfo.get("fromName", "Webmaster"),
                        subject=confirmationEmailInfo.get("subject", "Confirmation Email"),
                        bccEmail=confirmationEmailInfo.get("bcc", ""),
                        ccEmail=confirmationEmailInfo.get("cc", ""),
                        msgBody=msgBody
                        )
    return emailOptions

def email_to_html_text(msgBody):
    BODY_TEXT = html2text.html2text(msgBody)
    # The HTML body of the email.
    BODY_HTML = Pynliner().from_string(msgBody).run() # bleach.linkify(bleach.clean(msgBody))
    return BODY_TEXT, BODY_HTML

def send_email(
    toEmail="success@simulator.amazonses.com",
    fromEmail="webmaster@chinmayamission.com",
    ccEmail="",
    bccEmail="",
    fromName="Webmaster",
    subject="Confirmation email",
    msgBody="<h1>Confirmation</h1><br><p>Thank you for registering.</p>",
    ):

    # Todo: make sure sender is verified with Amazon SES.
    SENDER = "{} <{}>".format(fromName, fromEmail)
    AWS_REGION = "us-east-1"
    BODY_TEXT, BODY_HTML = email_to_html_text(msgBody)
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
            # ReturnPath='success@simulator.amazonses.com',
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
        pass

def send_confirmation_email(response, confirmationEmailInfo):
    """ Actually send confirmation email"""
    dct = create_confirmation_email_dict(response, confirmationEmailInfo)
    send_email(**dct)
    response.email_trail.append(EmailTrailItem(value=dct, date=datetime.datetime.now()))
    return dct