# Changelog

Todo:
"An attribute value cannot contain an empty string."

Roadmap
# 2.x
- Authentication with facebook and cognito.
- Emails: sanitize HTML
- Emails: restrict fromEmail to only a few, with a custom IAM policy.
- Download CSV server-side, not client-side.
- Allow duplication of forms and schemaModifiers.
- Email open and click tracking https://docs.aws.amazon.com/ses/latest/DeveloperGuide/configure-custom-open-click-domains.html
- 

todo:
- allow people to select "paid by check" instead of paypal.
- contact_name: true should work, not contact_name: {first: true, last: true}
- (todo): add ui-widget called "cff:checkShow":
```
{
  "ui:widget": "cff:checkShow",
  "ui:cff:check:title": "...",
  "ui:cff:check:description": "...",
  "ui:cff:check:className": "..."
}
```

BUGS:
- ui:cff:removeButtonText not working.

Current versions:
clients: (omrun, cmatej, ccmt staging) - wp plugin: 1.1.14

Todo:
- hide title "Payment" in form loading
- see if res.paid == True when displaying the payment method options.

## 1.1.16
- Server version: 1.1.18
- WP Plugin version: 1.1.12
- Hide label when ui:hidden widget is used (to make ui:cff:display:if:qs work properly).
- Allow authKey and specifiedShowFields to be specified in the form div (see documentation/permissions.md for more details)
- Change ui:cff:display:if:qs to ui:cff:display:if:specified (these fields are only shown whenever they're included within specifiedShowFields).
- Show schema and schemaModifier IDs in form edit page

## 1.1.15 (JS uploaded March 26, 2018)
- Server version: 1.1.17
- Implement ui:cff:display:if:qs.
- This allows conditional visibility of manualEntry:
```
{
  "title": "Method of Payment",
  "enum": ["Cash", "Check", "Square"],
  "ui:cff:display:if:qs": "manualEntry"
}
- And of couponCodes.
```

## 1.1.14 (JS uploaded March 26, 2018 8:04 AM PST)
- Fix "$contact_name" etc. showing up in paypal screen; get the proper values pre-filled on guest checkout.

## 1.1.13 -- (client side only) (JS v 1.1.13 - JS uploaded Mar 23, 2018 5:40 PM PST)
- Show round off, donation, and other columns in response table.

## 1.1.12 -- (client side only) (JS v 1.1.12 - JS uploaded 3/21/18 6:20 PM)
- Fix css rendering of button height.
- Allow add button and remove button text to be modified in the schemaModifier:
```json
"participants": {
  "type": "array",
  "items": [...],
  "ui:cff:addButtonText": "Add the person",
  "ui:cff:removeButtonText": "Remove! Custom text!",
}
```
- Add an http://localhost:8000/index-prod.html page for development to test production versions of js
- Reference dist folder of json-deref so that backticks don't show up (problem in IE)
- Add babel-polyfill and transpiling to allow it to work in IE 10+.

## 1.1.11 (client side only) (JS v1.1.11, WP PLUGIN v1.1.11) (JS uploaded 3/18/18 3:11 PM)
- Serve scripts in wordpress plugin from cloudfront; wp plugin is separate from the actual js.
- Use minified, production-build scripts
- allow "gulp serve" option for devs to make it self-contained (client)

## 1.1.10 (server only)
- add logging for emails sent and 
- bcc and cc support for emails (in confirmationEmailInfo)
- use send_email instead of send_raw_email for emails
- allow email "toField" to be deep (with dot notation to access value)
- fix bug: email confirmation not sent when using a coupon code on new response

## 1.1.9 (server only)
- add formSummary option (publicly accessible) from responses.

## 1.1.8 (server-side lambda only)
- Disallow editing of schema 

## 1.1.7 (client plugin only)
- Show payment info total as part of response table (to be exported as CSV)
- Row aggregations / summaries.
- Let dataOptions specify displayed and aggregated rows.

## 1.1.6 (server-side lambda only)
- Bugfix: allow coupon codes with arbitrary names
- Allow maximum of coupon codes to be negative (no maximum)
- Bugfix: mark new response with 100% off coupon code as PAID
- allow contentHeader and contentFooter option in emails

## 1.1.5 (client plugin only -- no updates on server lambda)
Feb 23 2018
- Allow multiple validations on a single path to be specified by an array.
```
  "ui:cff:validate:if":["age < 13 and race:'Half Marathon'==1 ", "a=b"]
  "ui:cff:validate:message": ["Participants under 13 cannot register for Half Marathon.", "message2"]
```
- add part of the framework for focusUpdateInfo (not functional yet)
- Form css changes (color, padding, bolded labels)
- Allow customization of "pay with paypal" button in paymentMethodInfo:
```
{
  "payButtonText": "Pay Now"
}
```


## 1.1.4
Feb 10 2018
Small fixes:
- Change default modes on JSON editor
- Graceful error handling when entering a non-numeric additional donation.

## 1.1.3
Feb 10 2018
### UI
- Show discount amount in paypal cart to account for coupon codes, etc.
- Paypal cart now shows all the items on update, as opposed to just "amount owed on update".
- Proper currency format using Intl.NumberFormat in javascript
- Format currency with two decimal places in email
- Email table formatting fixed
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

