For the confirmation page, you can modify the text that shows before the payment buttons with the `formOptions.paymentInfo.description` attribute.

`paymentInfo.description` can now be specified by a [Jinja](http://jinja.pocoo.org/) template, as well.

# Confirmation email
The confirmation email uses the jinja templating system. We have some custom filters built-in:

## format_date
`format_date` formats a given date string (in "YYYY-MM-DD" format) to the "en" locale.

For example,
```
{{"2000-10-10" | format_date}}
```

Will give a result of `Oct 10, 2000`.

It would be nice to be able to support other locales in the future.

## Confirmation email view link

In the confirmation email, you can use a view link. This renders a form response which is disabled. Just do:

```
Modify your response here: {{view_link}}.
```

Here is a sample view link: http://localhost:8000/v2/forms/5b3f8b7a978a860001e276c3/?responseId=5b3f8daf978a860001e276c5&mode=view

# Confirmation email templates.
You can define confirmation email templates in `formOptions.confirmationEmailTemplates`. These are currently accessible when an admin enters in a manual payment, during which they can select which template they would want to use.

As an example use case, we want to be able to either send 1) the entire email or 2) just a receipt with the payment table when we do so.

```
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
        }
    ]
}
```

Then a dropdown will come up during manual payment as follows:

![image](https://user-images.githubusercontent.com/1689183/64395284-87531780-d00e-11e9-865d-4c2414bcf0fb.png)