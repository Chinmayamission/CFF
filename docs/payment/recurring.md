To do recurring payments, include an item with `recurrenceDuration` in `paymentInfo.items`. This is currently implemented using [PayPal's Recurring Payments API](https://developer.paypal.com/docs/classic/paypal-payments-standard/integration-guide/Appx_websitestandard_htmlvariables/#recurring-payment-variables).

```
    paymentInfo: {
      currency: "USD",
      items: [
        {
          name: "Name",
          description: "Description",
          amount: 40,
          quantity: 1,
          recurrenceDuration: "1M",
          recurrenceTimes: "12"
        }
      ]
    },
```

`recurrenceDuration` (required) describes how often the recurring payment happens. It is in the format `[#][D|W|M|Y]`. For example, `1M` means "every month."

`recurrenceTimes` describes how many times the payment recurs. For example, setting it equal to `"12"` means that the payment will recur 12 times. If this is not specified, then the payment recurs indefinitely.

Note that if a recurring payment item is included in `paymentInfo.items` (defined as an item with a `recurrenceDuration`) and has an `amount * quantity` greater than zero, then when the user goes to PayPal checkout, they will only see the option to pay their recurring payment (not any other options in the cart).

## Payment installation pattern
Here is a sample configuration that describes how to allow a user to make payment installments:

```
[
    {
        "name": "Regular registration",
        "description": "Regular registration",
        "amount": "100",
        "quantity": "100"
    },
    {
        "name": "Monthly installment",
        "description": "Monthly installment",
        "amount": "$total / 3",
        "quantity": "$installment",
        "recurrenceDuration": "1M",
        "recurrenceTimes": "3",
        "installment": true
    }
]
```

When setting `installment` to true, this will make sure that this particular payment item will not be counted in `paymentInfo.total`. That way, it just represents an "installment" payment that pays for the rest of the fee. It will only be calculated on the client side, and its value will be calculated last.

## Tracking recurring payment status
We currently do not have a way to track whether a user has cancelled their subscription. This is a todo. Each time the payment comes in, the AMOUNT_PAID increases.

Confirmation emails are sent when recurring payments are received, even if PAID is not true (if the user is still PARTIALLY PAID).