CCAvenue integration is the best supported way by CFF to accept web payments in India. When a user checks out using CCAvenue, they will be redirected to the CCAvenue checkout page to complete their transaction.

## Account setup

Before a CCAvenue account can be used with CFF, an admin will need to add a manual entry directly in the database with the required fields. Please contact <a href="webmaster@chinmayamission.com">webmaster@chinmayamission.com</a> if you would like to get this set up.

```json
{
    "merchant_id":"...",
    "SECRET_working_key":"...",
    "access_code":"...",
    "_cls":"chalicelib.models.CCAvenueConfig"
}
```

## Configuration for a single form
Add the following key in paymentMethods:

```json
{
    "ccavenue": {
        "merchant_id": "...",
    }
}
```

The only required key is `merchant_id`, which is your CCAvenue merchant id.

### Using a sub account
To use a CCAvenue sub account, add the `sub_account_id` parameter as follows:

```json
"paymentMethods": {
    "ccavenue": {
        "merchant_id": "...",
        "sub_account_id": "..."
    }
}
```

### Prefill checkout fields

To prefill checkout fields on the CCAvenue page, you can use the following fields:

```json
{
    "ccavenue": {
        "billing_name": "{{ value.name }}",
        "billing_address": "{{ value.address.line1 }}",
        "billing_city": "{{ value.address.city }}",
        "billing_state": "{{ value.address.state }}",
        "billing_zip": "{{ value.address.zip }}",
        "billing_country": "{{ value.address.country }}",
        "billing_tel": "{{ value.phone }}",
        "billing_email": "{{ value.email }}"
    }
}
```

These fields can contain either constant strings or jinja2 templates. If they contain templates (as in the above example), they should be structured the same way as confirmation email templates are structured.

### Redirect URL

To set the URL that the user is redirected to after the payment is complete, set the `redirectUrl` parameter on the CCAvenue payment options dict. By default, this is set to `http://chinmayamission.com`.

```json
{
    "ccavenue": {
        "redirectUrl": "https://my-custom-site.com"
    }
}
```

### Cancel URL

When a user cancels their CCAvenue transaction, they are redirected to `http://chinmayamission.com`. Configuration of the Cancel URL is not yet supported yet.