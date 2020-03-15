import html2text
import os
from pynliner import Pynliner
from .util import (
    format_paymentInfo,
    format_payment,
    format_date,
    display_form_dict,
    human_readable_key,
)
from pydash.objects import get
import logging
from jinja2 import Environment, Undefined
import flatdict
from chalicelib.main import SMTP_USERNAME, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT
from chalicelib.models import serialize_model, EmailTrailItem
from chalicelib.util.pdf_generator import convert_html_to_pdf
import datetime
import smtplib

import email.utils
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders


class SilentUndefined(Undefined):
    def _fail_with_undefined_error(self, *args, **kwargs):
        return ""


env = Environment(undefined=SilentUndefined)
env.filters["format_payment"] = format_payment
env.filters["format_date"] = format_date


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
    if not confirmationEmailInfo:
        return
    templateText = get(
        confirmationEmailInfo, "template.html", "Confirmation Email Sample Text"
    )
    msgBody = fill_string_from_template(response, templateText)
    addCSS = False

    toField = confirmationEmailInfo["toField"]
    if type(toField) is not list:
        toField = [toField]

    # pre-process attachment templates
    attachments = [
        {
            "fileName": item.get("fileName", "attachment.pdf"),
            "contents": convert_html_to_pdf(
                fill_string_from_template(response, item["template"]["html"])
            ),
        }
        for item in confirmationEmailInfo.get("attachments", [])
    ]

    emailOptions = dict(
        toEmail=[get(response.value, i) for i in toField],
        fromEmail=confirmationEmailInfo.get("from", "webmaster@chinmayamission.com"),
        fromName=confirmationEmailInfo.get("fromName", "Webmaster"),
        subject=confirmationEmailInfo.get("subject", "Confirmation Email"),
        bccEmail=confirmationEmailInfo.get("bcc", ""),
        ccEmail=confirmationEmailInfo.get("cc", ""),
        replyToEmail=confirmationEmailInfo.get("replyTo", ""),
        msgBody=msgBody,
        attachments=attachments,
    )
    return emailOptions


def email_to_html_text(msgBody):
    BODY_TEXT = html2text.html2text(msgBody)
    # The HTML body of the email.
    BODY_HTML = (
        Pynliner().from_string(msgBody).run()
    )  # bleach.linkify(bleach.clean(msgBody))
    return BODY_TEXT, BODY_HTML


def send_email(
    toEmail,
    fromEmail,
    ccEmail,
    bccEmail,
    replyToEmail,
    fromName,
    subject,
    msgBody,
    attachments,
):

    # Todo: make sure sender is verified with Amazon SES.
    BODY_TEXT, BODY_HTML = email_to_html_text(msgBody)

    if toEmail and type(toEmail) is str:
        toEmail = toEmail.split(",")
    if ccEmail and type(ccEmail) is str:
        ccEmail = ccEmail.split(",")
    if bccEmail and type(bccEmail) is str:
        bccEmail = bccEmail.split(",")
    if replyToEmail and type(replyToEmail) is str:
        replyToEmail = replyToEmail.split(",")
    toEmail = [email for email in toEmail if email] if toEmail else []
    ccEmail = [email for email in ccEmail if email] if ccEmail else []
    bccEmail = [email for email in bccEmail if email] if bccEmail else []
    replyToEmail = [email for email in replyToEmail if email] if replyToEmail else []
    toEmail = ",".join(toEmail)
    ccEmail = ",".join(ccEmail)
    bccEmail = ",".join(bccEmail)
    replyToEmail = ",".join(replyToEmail)

    # Create message container - the correct MIME type is multipart/alternative.
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = email.utils.formataddr((fromName, fromEmail))
    msg["To"] = toEmail
    msg["Cc"] = ccEmail
    msg["Bcc"] = bccEmail
    msg["Reply-To"] = replyToEmail

    # Record the MIME types of both parts - text/plain and text/html.
    part1 = MIMEText(BODY_TEXT, "plain")
    part2 = MIMEText(BODY_HTML, "html")

    # Attach parts into message container.
    # According to RFC 2046, the last part of a multipart message, in this case
    # the HTML message, is best and preferred.
    msg.attach(part1)
    msg.attach(part2)

    for item in attachments:
        part = MIMEBase("application", "octet-stream")
        filename = item["fileName"]
        part.set_payload(item["contents"])
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f"attachment; filename= {filename}")
        msg.attach(part)

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.close()
    # Display an error if something goes wrong.
    except Exception as e:
        print("Error sending email to {}.".format(toEmail))
        raise e
    else:
        pass


def send_confirmation_email(response, confirmationEmailInfo):
    """ Actually send confirmation email"""
    dct = create_confirmation_email_dict(response, confirmationEmailInfo)
    send_email(**dct)
    response.email_trail.append(EmailTrailItem(value=dct, date=datetime.datetime.now()))
    return dct
