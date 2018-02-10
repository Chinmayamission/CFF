# Changelog

Todo:
"An attribute value cannot contain an empty string."

Roadmap
# 2.x
- Authentication with facebook and cognito.
- Show total amount in javascript front end ui as well.
- On updates, allow for donation.

## 1.1.3
### UI
- Show discount amount in paypal cart to account for coupon codes, etc.
- Paypal cart now shows all the items on update, as opposed to just "amount owed on update".
- Proper currency format using Intl.NumberFormat in javascript
- format currency with two decimal places in email
- email table formatting fixed
- Show empty string instead of "undefined" when exporting responses as CSV

### Functionality
- Implement coupon codes -- count towards maximum when user submits, not necessarily pays.
- Add coupon code widget (cff:couponCode) and money widget (cff:money)
- Expression parser (both js and python) allows to check for equality of strings (i.e., if race is a string, "race:5K==1" returns if race is 5K) -- before this would only work with arrays.
- properly compare ipn amount if updating to an amount *less* than before
- Allow simple conditional validation as follows (in schemaModifier):
```
{
  "age": ...,
  "race": ...
  "ui:cff:validate:if":"age < 13 and race:'Half Marathon'==1 "
  "ui:cff:validate:message": "Participants under 13 cannot register for Half Marathon."
}
```
- Fix "required" override in schemaModifier

## 1.1.2
Feb 6 2018
- Formula calculation on client side -- live refresh when user updates the form.

## 1.1.1
Feb 4 2018
- Add round off widget.
- Allow for use of $total in payment formulas.
```
    "roundOff": {
      "title": "Round off",
      "type": "number",
      "ui:widget": "cff:roundOff",
      "required": false
    },
    "additionalDonation": {
      "type": "number",
      "required": false,
      "title": "Or enter amount for additional donation.",
      "description": "All Donations are Tax-Deductible."
    }
```

## 1.1.0
Feb 2 2018
- (Lambda) no longer store confirmationEmailInfo in response; several checks for ipns (wrong emails, duplicate txn ids); payment_history array now stores all payments
- Began authentication integration with cognito (not enabled yet).
- Better schema / schema modifier generation by allowing fields to be EXCLUDED by default.
- Use cff prefixes for custom ui schema attributes
- Render form info pane twice in editing view
- Add phone number widget.

Lambda functions:
- Show only items with a net cost in confirmation page.

## 1.0.16
1/26/2018
fix date created unique id assignment

## 1.0.15
1/26/2018
Show numeric id for each respondent.
Allow for editing.
Better loading animations, etc.

## 1.0.14
1/19/2018
Fix required for checkbox temporarily.

## 1.0.13
1/19/2018
Form scrolls properly to top upon load
Fix export csv to export filtered data
Nicer label for response table headers
Show all other fields upon unwinding in response table.

## 1.0.12
1/16/2018
fix csv issue; better array display in mobile

