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