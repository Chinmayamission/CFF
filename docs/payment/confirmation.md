# Confirmation emails

Confirmation emails can be sent for each form response. They can be enabled and configured with the `formOptions.confirmationEmailInfo` property

!!! note
    By default, confirmation emails are not sent unless the user has paid. This means that, by default, if
    a form has no payment options set up, a confirmation email will be sent on submit.

    However, if you have configured a payment method and the user selects some items to buy, then they will only receive a confirmation email once they click through the confirmation page. In the case of PayPal, they will only receive the email when they have paid in full. If they select a `manual_approval` payment option, the email will be sent right after they click the button that triggers the `manual_approval` payment option.

## Configurable fields

```json
{
    "cc": "a@b.com",
    "bcc": "c@b.com",
    "replyTo": "b@b.com",
    "subject": "CFF Unit Testing Form\n Confirmation",
    "toField": "email",
    "fromName": "Test",
    "from": "a@b.com"
}
```

You can also use the `to` property to send email to a hardcoded email (such as email1@chinmayamission.com) instead of a specified field.


## Templates

Confirmation email body text is rendered through the [Jinja](http://jinja.pocoo.org/) templating system.

See [Sample templates](confirmation-templates.md) for some sample templates that may fit your needs with a little tweaking.

See the [Jinja2 template reference](confirmation-jinja.md) for a more complete list of features offered by CFF for creating your own template.

## Add attachments

To add attachments to an email, you can add an array to `confirmationEmailInfo.attachments`. Each item in the array defines a HTML template that is rendered and then converted to PDF.

```json
{
    "confirmationEmailInfo": {
        "attachments": [
            {
                "fileName": "receipt.pdf",
                "template": {
                    "html": "receipt template <h1>test</h1>"
                }
            }
        ]
    }
}
```

If you define multiple items to the `attachments` array, this will cause multiple attachments to be sent with each confirmation email, each attachment rendered by its own template.

!!! warning
    CFF uses [wkhtmltopdf](https://wkhtmltopdf.org/) to convert the given HTML template to a PDF file. This software might have some limitations for complex HTML files, so it is recommended to preview the PDF files once when using this feature.

## Define confirmation email templates

You can define confirmation email templates in `formOptions.confirmationEmailTemplates`. These are currently accessible when an admin enters in a manual payment, during which they can select which template they would want to use when sending an email.

!!! warning
    `formOptions.confirmationEmailTemplates` are not to be confused with confirmation email body Jinja2 templates. This topic relates to creating templates for the entire `confirmationEmailInfo` object *itself*, so that the admin can select from multiple variants of confirmation emails when they send custom emails.

As an example use case, an admin may want to be able to either send 1) the entire email or 2) just a receipt with the payment table when entering in a manual payment. To do so, we should define two confirmation email templates:

```json
{
    "confirmationEmailTemplates": [
        {
            "id": "receipt",
            "displayName": "Receipt",
            "confirmationEmailInfo": {
                "toField": "email",
                "subject": "Receipt",
                "template": {"html": "Here is your receipt. ... "}
            }
        },
        {
            "id": "fulltemplate",
            "displayName": "Full template",
            "confirmationEmailInfo": {
                "toField": "email",
                "subject": "Full template email",
                "template": {"html": "Here is your full tepmlate email. ... "}
            }
        }
    ]
}
```

Then a dropdown will come up during manual payment as follows:

![image](https://user-images.githubusercontent.com/1689183/64481611-56045400-d194-11e9-8e45-a3e250d1c78e.png)
