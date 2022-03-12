You can give a numeric counter to each response as it gets added to the form. This is useful to create a "human-readable" numeric id that people can then see in their confirmation email and use to look responses up.

To do this, in `formOptions` add:

```json
{
    "counter": {
        "enabled": true
    }
}
```

Then, the `counter` field on the response will be incremented, starting with 1 for the first response, etc. This field is assigned directly on the response (as opposed to on the response value), so it is stored independently of the form data or associated schema, and it is not editable by users or admins.

!!! note
    The numbers are only assigned once upon response creation. If a response is deleted, then that number will be skipped.

## Adding a counter to the response table
To add the counter to the response table, enter `COUNTER` in the header value and it will be added.

## Adding a counter to a confirmation email
To add a counter to the confirmation email (or any jinja template), just use `{{counter}}` to display it.
