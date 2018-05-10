# Fields
```
{
  "currency": "USD" | "INR",
  "redirectUrl": "http://sandeepany.chinmayamission.com/",
  "description"?: "<br><br>You will receive an email with further details about payment."
}

# Example

## Manual entry
In paymentInfo, add:
    "manualEntry": {"enabled": true, "inputPath": "manualEntry"}

In schema, add:
```
"manualEntry": {
  "type": "string"
}
```
In schemaModifier, add:
"manualEntry": {
  title": "Method of Payment",
  "enum": ["Cash", "Check", "Square"],
  "ui:cff:display:if:specified": true
}

See **permissions.md** to see how to protect this with an auth key.


total - not used
currency - not used
redirectUrl - where it should redirect after payment is complete.
sendConfirmationEmail - tba
allowModification - tba
acceptResponses - tba
includeInTotal for payment items - tba
```json
{
  "total": "a",
  "currency": "USD",
  "redirectUrl": "http://cmatej.org/",
  "items": [
    {
      "name": "CMA Tej Child Early Bird Registration",
      "description": "$15 each",
      "amount": "15",
      "quantity": "$participants.race:Child"
    },
    {
      "name": "CMA Tej Adult Early Bird Registration",
      "description": "$20 each",
      "amount": "20",
      "quantity": "$participants.race:Adult"
    },
    {
      "name": "Donation to CMA",
      "description": "Tax-deductible donation to CMA",
      "amount": "$additionalDonation + $roundOff * ((100 - (($total + $additionalDonation) % 100) ) / 100) * 100",
      "quantity": "1"
    }
  ]
}
```