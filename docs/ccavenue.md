In schemaModifier.paymentMethods:
```
{
  "ccavenue": {
    "billing_city": "$address.city",
    "billing_tel": "$phone",
    "redirectUrl": "http://omrun.cmsj.org/training-thankyou/",
    "billing_state": "$address.state",
    "billing_email": "$email",
    "billing_country": "USA",
    "billing_zip": "$address.zip",
    "billing_address": "$address.line1",
    "billing_name": [
      "$contact_name.first",
      " ",
      "$contact_name.last"
    ]
  }
}
```

In centers table:
```
{
  "id": 1,
  "name": "CMS",
  "paymentInfo": {
    "ccavenue": {
      "access_code": "....",
      "merchant_id": "....",
      "name": "www.localhost:8000",
      "working_key": "...."
    }
  }
}
```