The PayPal classic integration integrates using the PayPal Web API. Once the user clicks on the pay button, they are redirected to PayPal, from where they can complete the rest of the payment process.

## Sample configuration

```json
{
  "paypal_classic": {
    "zip": "$address.zip",
    "business": "payments@cmsj.org",
    "address2": "$address.line2",
    "city": "$address.city",
    "address1": "$address.line1",
    "image_url": "http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png",
    "item_number": "Registration for Training Only",
    "sandbox": false,
    "last_name": "$contact_name.last",
    "item_name": "2018 CMSJ OM Run",
    "cmd": "_cart",
    "state": "$address.state",
    "first_name": "$contact_name.first",
    "email": "$email"
  }
}
```

The only field that is required is `business` -- this is the email of the PayPal account that will receive the money from the form payments.

!!! note
    Make sure [IPNs are not turned off](https://www.paypal.com/us/smarthelp/article/how-do-i-stop-receiving-instant-payment-notifications-(ipns)-faq426) on your PayPal account. The integration should work by default, but if it doesn't work, that might be a reason things are not working properly.

!!! warning
    By default, PayPal accounts are configured such that they do not allow guest payments -- meaning that users will need to sign up for an account in order to check out. If you would like to enable guest payments, you must turn this setting on in your account: see [Enable guest payments](https://developer.paypal.com/docs/integration/direct/payments/guest-payments/).

The other fields are all optional. Note that some of the fields (such as `first_name` and `last_name`), if set, need to be set to payment expressions. This way, they will be dynamically set based on form data. This is used to prefill the guest checkout information fields for users who do use guest checkout to pay with PayPal.
