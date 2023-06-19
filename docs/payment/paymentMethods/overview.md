# Payment Methods

The following is a typical example of the `formOptions.paymentMethods` object:

```json
"paymentMethods": {
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
  },
  "ccavenue": {
    ...
  }
}
```

Note that the `paymentMethods` object is a dictionary, and it can have keys equal to any of the payment methods supported by CFF.

## Supported payment methods

The subpages within this section explain more about how to use and configure each payment method.

| Key name      | Description |
| ----------- | ----------- |
|  [paypal_classic](./paypal.md)  | PayPal classic integration |
|  [ccavenue](./ccavenue.md)  | CCAvenue integration |
|  [manual_approval](./manual-approval.md)  | Manual approval payment integration |
|  [manual_approval_2](./manual-approval.md)  | A secondary manual approval payment integration |
|  [redirect](./redirect.md)  | Redirects to a new page |
|  [text](./text.md)  | Shows text |


## Conditionally handling multiple payment methods

You can conditionally show or hide possible payment methods based on the form data by using the `cff_show_when` attribute on the config dictionary of a particular payment method. The value of `cff_show_when` should be a payment expression -- if this value evaluates to 0, the payment method is hidden on the confirmation page. Otherwise, the payment method is shown.

You can also use the `payButtonText` property to customize the text of the pay button for a particular payment method.