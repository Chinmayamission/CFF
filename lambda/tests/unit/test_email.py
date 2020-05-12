"""
pipenv run python -m unittest tests.unit.test_email
"""
from chalicelib.util.formSubmit.emailer import (
    create_confirmation_email_dict,
    fill_string_from_template,
)

# import tests.config
from tests.integration.constants import _
import unittest
from botocore.exceptions import ClientError
from chalicelib.models import Response
import os

CONFIRMATION_EMAIL_INFO = {
    "cc": None,
    "image": "http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png",
    "showResponse": True,
    "modifyLink": "onions",
    "showModifyLink": True,
    "subject": "CFF Unit Testing Form\n Confirmation",
    "toField": "email",
    "fromName": "Test",
    "from": "ccmt.dev@gmail.com",
    "message": "Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.",
}

CONFIRMATION_EMAIL_INFO_TEMPLATE = {
    "template": {
        "html": "<h1>Action Needed:</h1><h2>2018 Jagadeeshwara Mandir Suvarna Mahotsava Yajman Sponsorship Form</h2>Thank you for registration. As per Government of India FCRA guideliness CCMT is required to keep proof of Identity of the donor and hence we request you to send a copy of your passport to CCMT CFO abc.def@chinmayamission.com, copied on this email.<br> <table>{% for key, val in value.items() %}<tr><th>{{key}}</th><td>{{val}}</td></tr>{% endfor %}</table><br> <table><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr> <tr>{% for item in paymentInfo.values() %}<td>{{item.name}}</td><td>{{item.description}}</td><td>{{item.quantity}}</td>{{item.amount}}{% endfor %}</table>"
    },
    "subject": "CFF Unit Testing Form\n Confirmation",
    "toField": "email",
    "fromName": "Test",
    "from": "ccmt.dev@gmail.com",
}

# with open(os.path.dirname(os.path.realpath(__file__)) + '/test.html', 'r') as myfile:
#     data=myfile.read()
#     CONFIRMATION_EMAIL_INFO_TEMPLATE["template"]["html"] = data
# # TO_EMAIL = "success@simulator.amazonses.com"
# TO_EMAIL = "success@simulator.amazonses.com"
TO_EMAIL = "success@simulator.amazonses.com"

RESPONSE = {
    # "value": {"email": TO_EMAIL, "contact_name": {"first": "ashwin", "last": "ramaswami"}, "address": "abc defg"},
    "value": {"email": TO_EMAIL},
    "paymentInfo": {
        "currency": "USD",
        "total": 500,
        "redirectUrl": "onions",
        "items": [
            {
                "name": "name",
                "description": "description",
                "quantity": 1,
                "amount": 12.00,
            }
        ],
    },
}

EXPECTED_RES = {
    "toEmail": ["success@simulator.amazonses.com"],
    "fromEmail": "ccmt.dev@gmail.com",
    "fromName": "Test",
    "subject": "CFF Unit Testing Form\n Confirmation",
    "bccEmail": "",
    "ccEmail": None,
    "addCSS": True,
    "msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>",
}

EXPECTED_RES_TEMPLATE = {
    "toEmail": ["success@simulator.amazonses.com"],
    "fromEmail": "ccmt.dev@gmail.com",
    "fromName": "Test",
    "subject": "CFF Unit Testing Form\n Confirmation",
    "bccEmail": "",
    "ccEmail": "",
    "replyToEmail": "",
    "msgBody": "<h1>Action Needed:</h1><h2>2018 Jagadeeshwara Mandir Suvarna Mahotsava Yajman Sponsorship Form</h2>Thank you for registration. As per Government of India FCRA guideliness CCMT is required to keep proof of Identity of the donor and hence we request you to send a copy of your passport to CCMT CFO abc.def@chinmayamission.com, copied on this email.<br> <table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br> <table><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr> <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></table>",
    "attachments": [],
}


class TestCreateEmail(unittest.TestCase):
    maxDiff = None

    def setUp(self):
        self.response = Response(**RESPONSE)

    def test_create_email_paymentInfo_undefined(self):
        pass
        # send_confirmation_email({"value": {"email": TO_EMAIL}}, CONFIRMATION_EMAIL_INFO)

    # def test_create_email_success(self):
    #     res = create_confirmation_email_dict(self.response, CONFIRMATION_EMAIL_INFO)
    #     self.assertEqual(res, EXPECTED_RES)

    # def test_create_email_multiple_one_email_not_found(self):
    #     """ One email will be None -- it should not include this email here."""
    #     confirmationEmailInfo = dict(
    #         CONFIRMATION_EMAIL_INFO, **{"toField": ["email", "email2"]})
    #     res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
    #     self.assertEqual(res, dict(EXPECTED_RES, **{"toEmail": [TO_EMAIL, None]}))

    # def test_create_email_multiple_to(self):
    #     confirmationEmailInfo = dict(
    #         CONFIRMATION_EMAIL_INFO, **{"toField": ["email", "email2"]})
    #     self.response.value = {"email": TO_EMAIL, "email2": TO_EMAIL}
    #     res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
    #     self.assertEqual(res, dict(EXPECTED_RES, **{"toEmail": [TO_EMAIL, TO_EMAIL], "msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr><tr><th>email2</th><td>success@simulator.amazonses.com</td></tr></table><br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"}))

    # def test_create_email_custom_total_amount_text(self):
    #     confirmationEmailInfo = dict(
    #         CONFIRMATION_EMAIL_INFO, **{"totalAmountText": "CUSTOMCUSTOM"})
    #     res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
    #     self.assertEqual(res, dict(EXPECTED_RES, **{"msgBody": EXPECTED_RES["msgBody"].replace("Total Amount", "CUSTOMCUSTOM")}))

    # def test_create_email_show_response_false(self):
    #     confirmationEmailInfo = dict(
    #         CONFIRMATION_EMAIL_INFO, **{"showResponse": False})
    #     res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
    #     self.assertEqual(res, dict(EXPECTED_RES, **{"msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"}))

    # def test_create_email_table_column_order(self):
    #     confirmationEmailInfo = dict(
    #         CONFIRMATION_EMAIL_INFO, **{"responseTableOptions": {"columnOrder": ["email"]}})
    #     self.response.value = {"email": TO_EMAIL, "email2": TO_EMAIL}
    #     res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
    #     self.assertEqual(res, dict(EXPECTED_RES, **{"msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"}))

    # def test_create_email_table_column_order_complex(self):
    #     confirmationEmailInfo = dict(
    #         CONFIRMATION_EMAIL_INFO, **{"responseTableOptions": {"columnOrder": ["participants.0.name.first", "participants", "email"]}})
    #     self.response.value = {"participants": [{"name": {"first": "Ashwin"}, "age": 12}], "email": TO_EMAIL, "email2": TO_EMAIL}
    #     res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
    #     self.assertEqual(res, dict(EXPECTED_RES, **{"msgBody": "<h1>CFF Unit Testing Form\n Confirmation</h1><img class='mainImage' src='http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png' />Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.<br><br><table><tr><th>participant 1 name: first</th><td>Ashwin</td></tr><tr><th>participant 1 age</th><td>12</td></tr><tr><th>email</th><td>success@simulator.amazonses.com</td></tr></table><br><br><table class=paymentInfoTable><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr><td>name</td><td>description</td><td>$12.00</td><td>1</td></tr></table><br><br><h2>Total Amount: $500.00</h2>"}))

    def test_create_email_html_template(self):
        res = create_confirmation_email_dict(
            self.response, CONFIRMATION_EMAIL_INFO_TEMPLATE
        )
        self.assertEqual(res, EXPECTED_RES_TEMPLATE)

    def test_create_email_html_template_with_cc(self):
        res = create_confirmation_email_dict(
            self.response,
            dict(CONFIRMATION_EMAIL_INFO_TEMPLATE, cc="replyto@replyto.com"),
        )
        self.assertEqual(
            res, dict(EXPECTED_RES_TEMPLATE, ccEmail="replyto@replyto.com")
        )

    def test_create_email_html_template_with_hardcoded_to(self):
        res = create_confirmation_email_dict(
            self.response,
            dict(CONFIRMATION_EMAIL_INFO_TEMPLATE, to=["email1@chinmayamission.com", "email2@chinmayamission.com", "email3@chinmayamission.com"]),
        )
        self.assertEqual(
            res["toEmail"], ["success@simulator.amazonses.com", "email1@chinmayamission.com", "email2@chinmayamission.com", "email3@chinmayamission.com"]
        )

    def test_create_email_html_template_with_invalid_toField(self):
        res = create_confirmation_email_dict(
            self.response,
            dict(CONFIRMATION_EMAIL_INFO_TEMPLATE, toField=["email", "invalidpath"]),
        )
        self.assertEqual(
            res["toEmail"], ["success@simulator.amazonses.com"]
        )


    def test_create_email_html_template_with_replyto(self):
        res = create_confirmation_email_dict(
            self.response,
            dict(CONFIRMATION_EMAIL_INFO_TEMPLATE, replyTo="replyto@replyto.com"),
        )
        self.assertEqual(
            res, dict(EXPECTED_RES_TEMPLATE, replyToEmail="replyto@replyto.com")
        )

    def test_create_email_html_template_with_undefined(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO_TEMPLATE,
            template={"html": "Hello world. {{undef}}{{undef.undef}}Hohoho."},
        )
        res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
        self.assertEqual(
            res, dict(EXPECTED_RES_TEMPLATE, msgBody="Hello world. Hohoho.")
        )

    def test_create_email_html_template_format_payment_filter(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO_TEMPLATE,
            template={
                "html": "Hello world. {{paymentInfo.total | format_payment(paymentInfo.currency)}} Hohoho."
            },
        )
        res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
        self.assertEqual(
            res, dict(EXPECTED_RES_TEMPLATE, msgBody="Hello world. $500.00 Hohoho.")
        )

    def test_create_email_html_template_format_payment_filter_with_undefined(self):
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO_TEMPLATE,
            template={
                "html": "Hello world. {{ahuahu.total | format_payment(ahiahi.currency)}} Hohoho."
            },
        )
        res = create_confirmation_email_dict(self.response, confirmationEmailInfo)
        self.assertEqual(
            res, dict(EXPECTED_RES_TEMPLATE, msgBody="Hello world.  Hohoho.")
        )

    def test_email_html_template_true_false(self):
        # todo fix
        template = "<div style='width: 100%;background-color: #eee; margin: 10px 0px;'> <div style='width: 80%;margin: auto; box-shadow: 1px 1px 4px grey;padding: 10px 30px;background: white;'> <img src='https://d1dyr7ljeznkdv.cloudfront.net/cff.chinmayamission.com/Ramdoot%20banner.png' width='100%'> <div style='float: left'> CHINMAYA RAMDOOT CMTC </div> <div style='float: left'> Tax ID: </div> <br style='clear: both'> <br> <br> <br> Hari OM,<br><br> Thank you for supporting Chinmaya Ramdoot with your generous donation. <table style='border: 1px solid black; margin: 10px; padding: 10px;'> <tr> <td>CMTC<br>Chinmaya Ramdoot</td> <td>{{paymentInfo.total | format_payment(paymentInfo.currency)}} {% if value['Pariwar'] %}(monthly donation){% endif %} </td> </tr> </table> <br> <br> With Prem & OM,<br> Ramdoot Sevaks </div> </div>"
        confirmationEmailInfo = dict(
            CONFIRMATION_EMAIL_INFO_TEMPLATE, template={"html": template}
        )
        res = create_confirmation_email_dict(self.response, confirmationEmailInfo)

    def test_create_email_html_template_format_payment_parents_family(self):
        pass
        # response = self.response
        # template = "<div style='width: 100%;background-color: #eee; margin: 10px 0px;'> <div style='width: 80%;margin: auto; box-shadow: 1px 1px 4px grey;padding: 10px 30px;background: white;'> <img src='http://www.chinmayanewyork.org/wp-content/uploads/2014/08/banner17_ca1.png' width='100%'> <h1>Confirmation</h1> <h2>2018-19 Long Island Balavihar Registration Form</h2>Thank you for submitting the form. This is a confirmation that we have received your response.<br> <br> <table> <tbody> <tr> <th colspan=2>Parents</th> </tr> {% for parent in value.parents %} <tr> <th>Parent {{loop.index}} Name</th><td>{{parent.name.first}} {{parent.name.last}}</td></tr> <tr><th>Parent {{loop.index}} Email</th><td>{{parent.email}}</td></tr> <tr><th>Parent {{loop.index}} Phone</th><td>{{parent.phone}}</td> </tr> {% endfor %} <tr> <th colspan=2>Parents</th> </tr> {% for child in value.children %} <tr> <th>Child {{loop.index}} Name</th><td>{{child.name.first}} {{child.name.last}}</td></tr> <tr><th>Child {{loop.index}} DOB</th><td>{{child.dob}}</td></tr> <tr><th>Child {{loop.index}} Email</th><td>{{child.email}}</td></tr> <tr><th>Child {{loop.index}} Allergies</th><td>{{child.allergies}}</td></tr> <tr><th>Child {{loop.index}} Grade</th><td>{{child.grade}}</td> </tr> {% endfor %} <tr> <th>Address Line 1</th><td>{{value.address.line1}}</td> </tr> <tr> <th>Address Line 2</th><td>{{value.address.line2}}</td> </tr> <tr> <th>City</th><td>{{value.address.city}}</td> </tr> <tr> <th>State</th><td>{{value.address.state}}</td> </tr> <tr> <th>Zipcode</th><td>{{value.address.zipcode}}</td> </tr> <tr> <th>Geeta Chanting Class Interest</th><td>{{value.geeta_class}}</td> </tr> </tbody> </table> <h2>Payment Info</h2><table><tr><th>Item</th><th>Amount</th><th>Quantity</th></tr>{%for item in paymentInfo['items'] %}<tr><td>{{item.name}}</td><td>{{item.amount | format_payment(paymentInfo.currency)}}</td><td>{{item.quantity}}</td></tr>{% endfor %}</table><br><strong>Total Amount: {{paymentInfo.total | format_payment(paymentInfo.currency)}}</strong><br><br><br>We thank you for your contribution and support.<br>Chinmaya Mission New York is a not-for-profit organization exempt from Federal Income tax under section 501 (c) (3). Tax ID:.<br>May Gurudev's Blessing be with you.</div> </div>"
        # confirmationEmailInfo = dict(CONFIRMATION_EMAIL_INFO_TEMPLATE, template={"html": template})
        # res = create_confirmation_email_dict(response, confirmationEmailInfo)
        # self.assertEqual(res, dict(EXPECTED_RES_TEMPLATE, msgBody="Hello world.  Hohoho."), res)

    def test_template_format_date(self):
        self.assertEqual(
            fill_string_from_template(
                Response(value={"date": "2000-10-10"}), "{{value.date | format_date}}"
            ),
            "Oct 10, 2000",
        )
