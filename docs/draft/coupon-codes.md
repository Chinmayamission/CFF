Coupon codes are specified in `paymentInfo.items`.

Regular coupon code called CODE for 80% off the total price:
```
      {
        "name": "Coupon Code 80% off",
        "description": "Coupon Code 80% off",
        "amount": "-0.8 * $total",
        "quantity": "$couponCode:CODE"
      }
```

Regular coupon code called CODE that can only be used once:
```
      {
        "name": "Coupon Code 80% off",
        "description": "Coupon Code 80% off",
        "amount": "-0.8 * $total",
        "quantity": "$couponCode:CODE",
        "couponCode": "CODE",
        "couponCodeMaximum": "1"
      }
```

Coupon code with three maximum 5K's:
```
      {
        "name": "Coupon Code 100% off for 5K",
        "description": "Coupon Code 100% off for 5K",
        "amount": "-35 * $participants.race:5K",
        "quantity": "$couponCode:CODE",
        "couponCode": "CODE",
        "couponCodeMaximum": "3",
        "couponCodeCount": "$participants.race:5K"
      }
```