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
- Let minItems be specified dynamically based on other values.
- Bug: if paid amount > actual amount, it says amount paid = actual amount, not the actual paid amount!!!

## 2.0.8 (6/30/18)
- Use CosmosDB for backend
- Custom authentication UI
- Use Redux
- Lots of other changes.

## 1.3.26 (5/20/18) - backend 1.1.12
- Allow form structure "v2": allow uiSchema and schema to be specified directly within the form itself.
- Support free forms (no payment required)
- Bug fix: Export CSVs with newlines in them.
- Feature: Add "Loading" animation for ManualApproval component.

- In the form database entry, formOptions can now have successMessage, confirmationEmailInfo, showConfirmationPage (to skip confirmation page), paymentMethods etc.
- Note: formOptions is referred to as "schemaMetadata" in the code
- Note: v2 does not work with paid forms yet, only free forms.

## 1.3.25 (5/19/18)
- Quick fix on the js file names.

## 1.3.24 - backend 1.1.11 (5/19/18)
- Fix bug where opening pages in new tab would crash
- Better signed in UI (don't use greetings bar, it's all in the footer)
- Upgrade aws amplify.
- Add "auto_email" and "manual_approval" payment option

## 1.3.23 (5/10/18) - backend 1.1.9
- Allow "description" to be provided in paymentInfo which overrides default text after submit.

## 1.3.22 (5/5/18)
- Fix form embed url
- Show pagination in checkin table

## 1.3.21 (5/4/18)
- Add form embed page.
- Form detail page shows other form buttons on top

## 1.3.20 (5/2/18) (backend 1.1.8)
- CCAvenue integration!
- Fix scroll to top upon form submit.
- format payment properly with different currencies

Other:
- Fix paypal return urls and modify links to reflect parent url of iframe
- format payment properly with different currencies
- bug fix: response detail works when there are no participants column
- Change processing of paymentMethods (filling in billing_name etc. from forms) to server-side from client-side
- Client reads in paymentMethods from server (it can contain things such as the ccavenue hash)
- dev server runs on port 80
- **Note**: Some ccavenue payment information (such as secret key) is stored per-center in the centers table (for eventual migration of all payment info to center table); see docs/ccavenue.md for more information.

## 1.3.19 (4/28/18) (backend 1.1.5)
- dataOptions.columnOrder by default includes *only those columns*, to include the rest of the columns, use a wildcard:
["name.first", "name.last", "email"] -- only 3 columns
["name.first", "name.last", "email", "*"] -- 3 columns + more.
- Specific page for check in, with form permission Responses_CheckIn
  - Don't show entire response, unwind tables, or download csv in check in page.
  - Show "None" in check in detail table if empty value.
  - dataOptions.checkinTable contains info for check in, including the "omrunCheckin" option.
- Dev: Use TDD with Jest

## 1.3.18 (4/28/18)
- Allow paypal cancel url to reflect iframe's parent, not cff url.
- Bug fix: Form checkbox and round off are now required when specified.

## 1.3.17 (4/28/18)
- Change ui:cff:backgroundColor to ui:cff:background so it allows for images, etc. Ex:
```    "ui:cff:background": "url('https://i.imgur.com/FlP2bNx.png')",```
- Allow for custom html in titles, so you can add images.
- Default loading background is white

## 1.3.16 (4/27/18)
- Swap center name in form url: /CCMT/forms/{formId}

## 1.3.15 (4/27/18)
- Bug fix: show required properly
- Fix admin urls' redirecting when refreshed.
- Bug fix: Disable type overriding in schemas
- Include center name in form URL. /forms/CCMT/{formId}

## 1.3.14 (4/27/18)
- Base target to allow iframe embedding links to open in parent
- Change colors of HM/10K for bib check in.
- Nice CSS for standalone form view (looks like a form page).
- Allow background color of standalone form view to be controlled by ui:cff:backgroundColor.
- Fix gulp serve issue.

## 1.3.13 (4/27/18)
- Remove logs that broke code.

## 1.3.12 (4/27/18)
- Allow arbitrary forms to be rendered on CFF website, too (and included as an iframe). Thus, move urls: https://cff.chinmayamission.com/admin and https://cff.chinmayamission.com/form/asjdlajskdl&specifiedShowFields={"title":"HU"}
- Build two versions of the script -- app.js (for wordpress) and app.[version].js (for CFF website), fixing cache problem for wordpress websites.

## 1.3.11 (4/27/18)
- Bug fix: Don't check them in by default!
- Disable hard source webpack plugin for now, doesn't work.

## 1.3.10 (4/27/18)
- Properly override top level required field in schema
- Only show checkin information if "omrunCheckin" is true.
- Add response checkin functionality (can only do if you have response edit permissions.)
- Bring the columns in columnOrder to the front; still keep the other columns though.

## 1.3.9 (4/26/18)
- Hide payment info table if no rows found.

## 1.3.8 (4/26/18)
- Add onChange handler back again, so payment table updates in real time.
- Fix jest tests

## 1.3.7 (4/26/18)
- Fix IE 11 issue by referencing "json-schema-deref-sync/dist" for now.
- Fix calculation of PAYMENT_INFO_ROUNDOFF, etc.

## 1.3.6 (4/23/18)
- Make the form work on Internet Explorer by compiling code for older browsers (actually, this doesn't work)
- Remove some old code / clean up code.

## 1.3.5 (4/22/18)
- Fix bug: If specified show fields is not specified, it should still work.

## 1.3.4 (4/22/18)
- Set ui:cff:updateFromField's value to ui:cff:defaultValue if necessary
- Specify JSON to override schemaModifier in data-ccmt-cff-specified-show-fields (lets you create custom forms with 1 participant, 2 participants, or hidden stuff, etc.)

## 1.3.3 (4/22/18)
- Add updateFromField option (see docs/updateFromField.md)
- Show headers on each row of array field by default
- Upgrade RJF to 1.0.3 (from 0.5!) *BREAKING CHANGE* - uses ajv json validator, so required has to be an array, not a boolean anymore.

## 1.3.2 (4/21/18)
- Make minItems work in schemaModifier
- Add some jest unit tests
- Refactor some of schema expression parsing code
- In deploy.py script: Use cloudfront invalidations instead of versioning script names, so that script urls are constant (for use with wordpress plugin)
### 1.3.2-1


## 1.3.1 (4/21/2018)
- Package webpack into only two js files (so it works with forms on the WP plugin).
- Add footer to admin page.

## 1.3.0.3 (4/20/2018) (backend 1.1.0)
- Output files have version numbers in their names.
- Created a deploy script which automatically uploads to S3 and cloudfront.

## 1.3.0 (4/20/2018) (backend 1.1.0)
Form Page:
- Allow form submit page to work with chalice API

Admin Page:
- hide entire form list on detail view; add back button
- Fix styling, remove links for disabled buttons on admin console.
- Add form edit page
- Select first center by default upon logging in.
- Add "share" page with the ability to modify form permissions.

Other fixes:
- Permissions format changed: {userId: {perm1: true, perm2: true}, ...}
  - Permissions also renamed to be more consistent: ex ResponsesEdit --> Responses_Edit
- Bug fix: fix minifying of js
- Small fix: sandbox mode now depends on production or not (production = no sandbox, no production = sandbox)
- New ipn notification url: /responses/{responseId}/ipn


## 1.2.8 (4/12/2018)
- Fix login issue -- login works without having to refresh now.

## 1.2.7 (4/12/2018)
- Create new form button (from existing schema)
- Create user entry in database with info on new login.

## 1.2.6 (4/10/2018)
- Make responseEdit button go to proper page.
- Re-add numeric id.
- Code to auto-assign bib numbers (commented out for now.)
- Fix filter bug with numbers.

## 1.2.5 (4/9/2018)
- fix duplicate data call in ResponseSummary
- Remove temporary "numeric id" that was being generated.
- show unwind tables using react router
- dynamically load each response, add a mock checkbox to "check in".

## 1.2.4 (4/6/2018) (chalice backend 1.0.4)
- webpack minify css and put in a separate file
- Highlight responses / summary buttons so you know what page you're on, and grey out buttons you have no permissions to.
- show cff:cognitoIdentityId: before id
- graceful error handling on session expire
- Generic data loading HOC for all views (DataLoadingView)
- Responses search is case insensitive.
- Responses edit page -- allows things such as bib assignment from admin. Users of this must have the `ResponsesEdit` permission.

## 1.2.3 (4/2/2018)
- Refactor loading, proper error handling for responses page
- Better error handling
- Remove aggregate info from responses table


## 1.2.2 (4/1/2018)
- React router
- Response summary page
- Better styling changes of admin page, with bootstrap!

## 1.2.1 (3/31/2018)
- Fixed bug -- shows access denied screen properly.
- Add hashes to prod HTML page and js files.

## 1.2 (March 31, 2018)
- This is now split into a standalone site, which uses chalice backend ("standalone" branch).
- Permissions: ViewResponses

## 1.1.17 (JS uploaded March 27, 2018 2:26 PM PST)
- Hide description for hidden fields (hidden by ui:cff:display:if:specified)

## 1.1.16 (JS uploaded March 27, 2018 11:39 AM PST)
- Server version: 1.1.18
- WP Plugin version: 1.1.12
- *Main features*: manual entry, conditional display with ui:cff:display:if:specified
- Hide label when ui:hidden widget is used (to make ui:cff:display:if:qs work properly).
- Allow authKey and specifiedShowFields to be specified in the form div (see documentation/permissions.md for more details)
- Change ui:cff:display:if:qs to ui:cff:display:if:specified (these fields are only shown whenever they're included within specifiedShowFields).
- Show schema and schemaModifier IDs in form edit page
- Fix issues with paymentInfo_received shown in table, so manual entry works.

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

