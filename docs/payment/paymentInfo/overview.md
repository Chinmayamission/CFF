# Payment Info

The following is a typical example of the `formOptions.paymentInfo` object:

```json
{
  "paymentInfo": {
    "currency": "USD",
    "redirectUrl": "http://omrun.cmsj.org/training-thankyou/",
    "items": [
      {
        "name": "2019 CMSJ OM Run",
        "description": "Registration for Training Only",
        "amount": "50",
        "quantity": "participants"
      }
    ]
  }
}
```

Note that the only required field here is `items`. Within each element of `items`, all four fields -- `name`, `description`, `amount`, and `quantity` -- are required.

## Payment Items

Payment items, specified in the `items` array, define the actual payment calculation for a specific response in the form.

**name**: Name of the item.

**description**: Description of the item.

**amount**: A CFF [payment expression](./expressions.md) that evaluates to the item amount.

**quantity**: A CFF [payment expression](./expressions.md) that evaluates to the item quantity.

The payment info for a response is calculated live when a user modifies the response value, and also calculated once the user submits a form. For each item, `amount` and `quantity` are evaluated to get numbers and are then multiplied together to get the subtotal for that particular payment item -- this subtotal will be set in the response as the `total` property of the payment item. Finally, only payment items that have a total that is not equal to zero will be saved in the response.

!!! note
    You can also have payment items with negative values for amount and/or quantity. This allows you to create payment items that can act as specific discounts.

Note that `amount` and `quantity` are strings, not numbers, as they are payment expressions that are dynamically evaluated based on the response value. For more information on how `amount` and `quantity` should be structured, see [Payment Expressions](./expressions.md).

## Currency

The `paymentInfo.currency` field can be set -- if this field is not set, the default currency is USD. Currently, we only support "USD" and "INR" for this value.

```json
{
  "currency": "INR"
}
```

### Multiple currencies

CFF has limited support for multiple currencies. A single response can only be tied to a single currency, but CFF does support allowing responses from the same form to each be associated with a different currency.

You can also set the `paymentInfo.currencyTemplate` variable in order to do this. This field must be set to a Jinja2 template -- similar to a confirmation email template -- that evaluates to a valid currency based on the response value. For example, to make a form conditionally a different currency based on the user-entered nationality:

```json
{
  "currencyTemplate": "{% if value.nationality == 'India' %}INR{% else %}USD{% endif %}"
}
```
!!! note
    If you take advantage of the multiple currencies feature, you will also need to adjust the payment expressions in `paymentInfo.items` accordingly so that they also change their values based on the currency (because you may very likely not want to charge both 100 USD and 100 INR for the same item!)

!!! warning
    Because payment information must be calculated on the frontend, we actually use [nunjucks](https://github.com/mozilla/nunjucks), not Jinja2, to parse the template on the frontend, so there's a possibility of slight compatibility differences between nunjucks and Jinja2.

### Redirect URL

By default, the user will be redirected to [http://www.chinmayamission.com/](http://www.chinmayamission.com/) after completing a payment with an external provider, such as PayPal or CCAvenue. The `paymentInfo.redirectUrl` property can override this value. For example, to redirect users to a custom thank-you page:

```json
{
  "redirectUrl": "http://omrun.cmsj.org/training-thankyou/"
}
```