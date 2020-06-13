!!! warning
    `formOptions.confirmationEmailTemplates` are not to be confused with confirmation email body Jinja2 templates. This topic is an advanced feature and relates to creating templates for the entire `confirmationEmailInfo` object *itself*, so that the admin can select from multiple variants of confirmation emails when they send custom emails.

You can define confirmation email templates in `formOptions.confirmationEmailTemplates`. These are currently accessible when an admin enters in a manual payment, during which they can select which template they would want to use when sending an email.

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
