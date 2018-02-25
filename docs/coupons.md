# Usage
In schema, add (as child of first "properties"):
```json
"couponCode": {
    "ui:widget": "cff:couponCode",
    "description": "Coupon will be applied at checkout.",
    "title": "Coupon Code",
    "type": "string"
}
```
In schemaModifier, add (to top level):
```json
"couponCode": true
```
In coupons:
```json
"free": {
    "name": "Free",
    "description": "Coupon Code",
    "max": 1,
    "amount": "-$total"
}
```
The ```amount``` field is a formula; coupons are basically treated as payment items so add a negative sign to make it a discount. 

If "max" is not defined or is negative, there is no max.

To make a "negative" coupon (such as for a negotiated price value) just do the following:
```json
    "amount": "5000"
```

# Data structure
Each form has a "couponCodes" and "couponCodes_used" attribute.
couponCodes_used: 
```json
"free": {
    "responses": [
        "30424-2343254-4395-4385",
        "392043-sdf094sjdf08-234"
    ]
}
```

# Important notes
- Coupon codes are applied on checkout. So coupon codes only show up in the cart after clicking "submit".
- Coupon codes are marked as "used" as soon as the user goes to the confirmation page. So if users use a coupon code but don't pay, you may want to increase the maximum.