## Template context

By default, all the variables for the given response are available through the `value` variable in the template context. For example, given a form response with the following value:

```json
{
    "name": "Ashwin"
}
```

Using the template `Hello, {{value.name}}` will resolve to `Hello, Ashwin`.

### View link

In the confirmation email template, you can use the `view_link` variable to get a response view link. This renders a form response which is disabled. Just do:

```html
Modify your response here: {{view_link}}.
```

The resulting view link will be equal to `{CFF_URL}/{formId}?responseId={responseId}&mode=view`.

!!! note
    The view link will only work if `formOptions.responseCanViewByLink` is set to true; this value is set to false by default for security reasons.

### Edit link

In the confirmation email template, you can use the `edit_link` variable to get a response edit link. This renders the form, with the response data pre-filled in. Just do:

```html
Modify your response here: {{edit_link}}.
```

The resulting view link will be equal to `{CFF_URL}/{formId}?responseId={responseId}&mode=edit`.

!!! note
    The edit link will only work if both `formOptions.responseCanViewByLink` and `formOptions.responseCanEditByLink` are set to true; both are set to false by default for security reasons.


## Custom filters

Jinja2 has a [filters](https://jinja.palletsprojects.com/en/2.11.x/templates/#filters) feature that allows you to apply certain functions to context variables within the template. In addition to the [built-in filters](https://jinja.palletsprojects.com/en/2.11.x/templates/#builtin-filters), CFF also supports the following custom filters:

### format_date
`format_date` formats a given date string (in "YYYY-MM-DD" format) to the "en" locale.

For example, the following template:

```html
{{"2000-10-10" | format_date}}
```

Gives a result of `Oct 10, 2000`.

### format_payment
`format_payment` formats a given amount in the specified currency.

For example, the following template:

```html
{{200 | format_payment("USD")}}
```

Gives a result of `$200`.

Note that this template is usually used with regard to `paymentInfo`, so a common use case might look something like this:

```html
{{paymentInfo.total | format_payment(paymentInfo.currency)}}
```