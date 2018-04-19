import os
import boto3
from botocore.exceptions import ClientError
# import bleach
import html2text
from pynliner import Pynliner
from .util import format_paymentInfo, format_payment, display_form_dict
from pydash.objects import get
import logging

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
    max-width: 200px;
    float: right;
    margin: 20px;
}
"""

def send_confirmation_email(response, confirmationEmailInfo):
    if confirmationEmailInfo:
        toField = confirmationEmailInfo["toField"]
        msgBody = ""
        if "contentHeader" in confirmationEmailInfo:
            msgBody += confirmationEmailInfo["contentHeader"]
        msgBody += "<h1>{}</h1>".format(confirmationEmailInfo.get("subject", "") or confirmationEmailInfo.get("header", "") or "Confirmation Email")
        if "image" in confirmationEmailInfo:
            msgBody += "<img class='mainImage' src='{}' />".format(confirmationEmailInfo["image"])
        msgBody += confirmationEmailInfo.get("message", "")
        if confirmationEmailInfo["showResponse"]:
            msgBody += "<br><br>" + display_form_dict(response["value"])
        
        if 'items' in response['paymentInfo'] and len(response['paymentInfo']['items']) > 0:
            msgBody += "<br><br><table class=paymentInfoTable>"
            msgBody += "<tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr>"
            for paymentInfoItem in response['paymentInfo']['items']:
                msgBody += "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>".format(
                    paymentInfoItem.get('name',''),
                    paymentInfoItem.get('description',''),
                    format_payment(paymentInfoItem.get('amount',''), 'USD'),
                    paymentInfoItem.get('quantity','')
                )
            msgBody += "</table>"
        
        msgBody += "<br><br><h2>Total Amount: {}</h2><br><h2>Amount Received: {}</h2>".format(format_paymentInfo(response["paymentInfo"]), format_payment(response.get("IPN_TOTAL_AMOUNT", 0), 'USD'))
        if confirmationEmailInfo["showModifyLink"] and "modifyLink" in response:
            msgBody += "<br><br>Modify your response by going to this link: {}#responseId={}".format(confirmationEmailInfo.get("modifyLink", response["modifyLink"]), str(response["responseId"]))
        if "contentFooter" in confirmationEmailInfo:
            msgBody += confirmationEmailInfo["contentFooter"]
        # todo: check amounts and Completed status, and then send.
        send_email(toEmail=get(response["value"], toField),
                            fromEmail=confirmationEmailInfo.get("from", "webmaster@chinmayamission.com"),
                            fromName=confirmationEmailInfo.get("fromName", "Webmaster"),
                            subject=confirmationEmailInfo.get("subject", "Confirmation Email"),
                            bccEmail=confirmationEmailInfo.get("bcc", ""),
                            ccEmail=confirmationEmailInfo.get("cc", ""),
                            msgBody=msgBody)

def send_email(
    toEmail="aramaswamis@gmail.com",
    fromEmail="webmaster@chinmayamission.com",
    ccEmail="",
    bccEmail="",
    fromName="Webmaster",
    subject="Confirmation email",
    msgBody="<h1>Confirmation</h1><br><p>Thank you for registering.</p>"
    ):
    # Replace sender@example.com with your "From" address.
    # This address must be verified with Amazon SES.
    SENDER = "{} <{}>".format(fromName, fromEmail)
    # If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
    AWS_REGION = "us-east-1"
    # The email body for recipients with non-HTML email clients.
    BODY_TEXT = html2text.html2text(msgBody)
    # The HTML body of the email.
    BODY_HTML = Pynliner().from_string(msgBody).with_cssString(ccmt_email_css).run() # bleach.linkify(bleach.clean(msgBody))
    # The character encoding for the email.
    CHARSET = "utf-8"
    client = boto3.client('ses',region_name=AWS_REGION)

    if toEmail and type(toEmail) is str: toEmail = toEmail.split(",")
    if ccEmail and type(ccEmail) is str: ccEmail = ccEmail.split(",")
    if bccEmail and type(bccEmail) is str: bccEmail = bccEmail.split(",")
    
    try:
        response = client.send_email(
            Source=SENDER,
            Destination={
                'ToAddresses': toEmail or [],
                'CcAddresses': ccEmail or [],
                'BccAddresses': bccEmail or [],
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