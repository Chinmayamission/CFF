# Confirmation emails

Confirmation emails can be sent for each form response. They can be enabled and configured with the `formOptions.confirmationEmailInfo` property.

!!! note
    By default, confirmation emails are not sent unless the user has paid. This means that, by default, if
    a form has no payment options set up, a confirmation email will be sent on submit.

    However, if you have configured a payment method and the user selects some items to buy, then they will only receive a confirmation email once they click through the confirmation page. In the case of PayPal, they will only receive the email when they have paid in full. If they select a `manual_approval` payment option, the email will be sent right after they click the button that triggers the `manual_approval` payment option.

## Configurable fields

The following fields can be configured:

```json
{
    "cc": "a@b.com",
    "bcc": "c@b.com",
    "replyTo": "b@b.com",
    "subject": "CFF Unit Testing Form\n Confirmation",
    "toField": "email",
    "fromName": "Test",
    "from": "a@b.com",
    "template": {
        "html": "[html template]"
    }
}
```

Only `subject`, `template`, `toField` / `to`, and `from` are required fields.

### About toField
`toField` specifies a path from which the "to" field of the email is retrieved from. For example, if it is set to `email`, then the confirmation email will be sent to the value of the `email` field in the form (so the form data must look something like this:)

```json
{
    "email": "abc@gmail.com",
    ...
}
```

You can also use the `to` property to send email to a hardcoded email (such as email1@chinmayamission.com) instead of a specified field.

```json
{
    "to": "a@b.com"
}
```

### Configuring a "from" field

The `from` field specifies which email address sends the email. All emails are sent through Amazon's Simple Email Service (SES). This means that all additional `from` identities must be confirmed by an admin through the AWS console.

If you want to send emails from a custom email address, the easiest way to do so (without needing to go through confirmation) is to set the `from` field to equal `itsupport.ccmt@chinmayamission.com` and then change the `replyTo` field to be equal to the address of the custom sender. For example:

```json
{
    "from": "itsupport.ccmt@chinmayamission.com",
    "replyTo": "custom.email@chinmayacenter.com"
}
```

### Multiple email addresses

You can specify multiple emails by giving an array value for `cc`, `bcc`, `toField`, or `to`. For example, you can specify `{"cc": ["a@b.com", "a2@b.com"]}`.


## Templates

Confirmation email body text is set through `confirmationEmailInfo.template.html` field. This text can be specified as a [Jinja](http://jinja.pocoo.org/) template, so that the email dynamically changes based on what the individual form response contains.

See [Sample templates](confirmation-templates.md) for some sample templates that may fit your needs with a little tweaking.

See [Making your own templates](confirmation-jinja.md) for a more complete list of features offered by CFF for creating your own template.