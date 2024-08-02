## 7.8.0

* Fix radio button spacing
* Support `key` field for counter, so that counter can be reset.

## 7.7.1

* Fix form spacing, snapshots

## 7.7.0

* Allow "meta" tags in successMessage and other places
* Don't show quantity for recurrences in payment table

## 7.6.8

* Fix bug where "Number Of Attendees" dropdown wasn't working properly

## 7.6.7

* Update Maps API Key

## 7.6.6

* Update Maps API Key

## 7.6.5

* Make email matching case-insensitive for paypal ipn handler

## 7.6.4

* Remove currency validation in payment status detail, so that other currencies can be used.

## 7.6.1

* Fix bug where `paymentInfoItemPaidSum` doesn't work when total amount paid is zero (for example, because of coupon codes).

## 7.6.0

* Address Autocomplete Field: Add `closestLocationsFilter` option to allow filtering closest locations before they are saved to the form data.
* Address Autocomplete Field: Fix logic so it works for UK-based addresses.

## 7.5.0

* Hide `submitOptions` for admins as it was confusing.
* Allow disabling email sending on form submit with `defaultSubmitOptions`, and allow this to be conditional.
* Support `formOptions.theme.rootRaw` property to inject arbitrary CSS into a form inside a `<style>` tag.
* Support `formOptions.messages.confirmationPageTitle` property to replace title on the confirmation page.

## 7.4.2

* Address Autocomplete Field: Store `distance` key in closest locations when using the `saveNClosestLocations` option.

## 7.4.1

* Fix bug: Allow `redirect`'s form data keys to be lodash dot paths.
* Allow HTML to be input in `text` payment method; and don't show a blue alert background by default.

## 7.4.0

* Address Autocomplete Field: Support storing the top N closest locations in form data using the `saveNClosestLocations` option.

## 7.3.1

* Fix bug where paymentMethods were not showing properly.

## 7.3.0

* Support `initialFormData` query string to populate initial form data when viewing forms.
* Support `redirect` payment method, which redirects to a new form.
* Support `text` payment method, which shows some text.
* UI / padding fixes for forms.

## 7.2.1

* Sheets sync function: upgrade to node 14, adjust timeout / rate, only run sheets script for om run for now

## 7.2.0

* Allow configuring the link to modify responses by specifying `formOptions.modifyLink`.

## 7.1.1

* Handle subscr_signup changes in paypal ipn handler (https://github.com/Chinmayamission/CFF/pull/309)

## 7.1.0

* Upgrade react-jsonschema-form to 4.2.0

## 7.0.0

* Use CI to deploy google sheets lambda scripts by @epicfaace in https://github.com/Chinmayamission/CFF/pull/288
* Trim login emails by @epicfaace in https://github.com/Chinmayamission/CFF/pull/291
* Fix prod release pipeline by @epicfaace in https://github.com/Chinmayamission/CFF/pull/294
* Fix #292 by upgrading chalice by @epicfaace in https://github.com/Chinmayamission/CFF/pull/293
* Upgrade to python 3.9 by @epicfaace in https://github.com/Chinmayamission/CFF/pull/298

* build(deps): bump aws-sdk from 2.425.0 to 2.814.0 by @dependabot in https://github.com/Chinmayamission/CFF/pull/279
* build(deps): bump ws from 5.2.2 to 5.2.3 by @dependabot in https://github.com/Chinmayamission/CFF/pull/282
* build(deps): bump ua-parser-js from 0.7.19 to 0.7.31 by @dependabot in https://github.com/Chinmayamission/CFF/pull/281
* build(deps): bump color-string from 1.5.3 to 1.6.0 by @dependabot in https://github.com/Chinmayamission/CFF/pull/280
* build(deps): bump url-parse from 1.5.3 to 1.5.10 by @dependabot in https://github.com/Chinmayamission/CFF/pull/285
* build(deps): bump y18n from 4.0.0 to 4.0.3 by @dependabot in https://github.com/Chinmayamission/CFF/pull/286
* build(deps): bump async from 2.6.2 to 2.6.4 by @dependabot in https://github.com/Chinmayamission/CFF/pull/300
* build(deps): bump bson from 1.1.1 to 1.1.6 by @dependabot in https://github.com/Chinmayamission/CFF/pull/261
* build(deps): bump lodash from 4.17.19 to 4.17.21 by @dependabot in https://github.com/Chinmayamission/CFF/pull/258


## 6.3.3
* build(deps): bump url-parse from 1.4.7 to 1.5.3 by @dependabot in https://github.com/Chinmayamission/CFF/pull/275
* Upgrade dependencies to fix vulnerability in babel by @epicfaace in https://github.com/Chinmayamission/CFF/pull/277
* build(deps): bump mkdocs from 1.1 to 1.2.3 by @dependabot in https://github.com/Chinmayamission/CFF/pull/278

## 6.3.2
* Fix: Changed Google Maps API Key for production (#254) 
* Fix: Fix IPN error payment logic for CCAvenue (#274)

## 6.3.1
* Fix: don't crash backend when summary view has no results; just return None instead

## 6.3.0
* Responses table view: Allow groupEdit to be a text box (not just a select box). This means that admins can now enter arbitrary values from the response view by clicking the "edit" button in a specific cell (see https://github.com/Chinmayamission/CFF/pull/252).
* Responses table view: By default, sort responses by date created instead of date modified.

## 6.2.0
* Response search: Add `formOptions.search.exactMatch` option, which when set to true, ensures that the search query must match a given one of the fields to return a result. This can significantly speed up searching and is useful with large data sets or when the search query matches exactly (such as an email address).
* Response search: Order results in order of date_created, descending, by default. Previously, results were unordered.
## 6.1.2
No changes

## 6.1.1
* Fix: request compressed version of responses API, to get around 6 MB lambda response body size limit

## 6.1.0
* Allow searching to be performed with API keys (see docs/api/search-guide.md)

## 6.0.3
* Fix: don't remove style tags when using juice. This allows us to specify media queries in `<style>` tags.

## 6.0.2
* Fix: allow users to edit loginRequired forms
* Fix: hide submit button on confirmation page
* build(deps): bump lodash from 4.17.15 to 4.17.19 (#239)
* build(deps): bump elliptic from 6.5.0 to 6.5.3 (#241) 

## 6.0.1
* Fix issue: "Go back and edit responses" link does not work on loginRequired forms (#237)

## 6.0.0
* confirmationEmailInfo: support `to` property to send to a hardcoded email address. This will break existing forms that have toField equal to an actual email addresses (rather than just the field name that corresponds to the email); such forms will need to specify this hardcoded email in the `to` property instead.
* Allow running mongodb locally to work on mac
* Add docker-compose for quick mongodb setup

## 5.6.0
* Allow anonymous access to response dataOptionView using apiKey parameter
* Fix width of form titles to be full width

## 5.5.0
* Confirmation emails - allow toField to be equal to an actual email address, rather than just a field used in the form.
* Backend: remove some unncessary logs

## 5.4.0
* Link logo on navbar to home on admin page
* Give superuser access to list all forms and have all permissions
* Allow editing of org permissions by superuser

## 5.3.0
* Store a hashed version of responseListApiKey for security (`hashlib.sha512("apikey".encode()).hexdigest()`)

## 5.2.0
* Admin: show submit options when viewing an existing form (#231)
* Add formOptions.responseListApiKey for anonymous access to responses
* Support `ui:cff:disableModifExistingItems` for arrays

## 5.1.0
* Admin: make view/edit/inspect for responses show as icons and pop up as modals
* Admin: remove FormEmbed page and add it to the FormShare page
* Admin: Fix issue with user dashboard failing on prod
* Allow adding PDF attachments to confirmation emails.
  - As part of this, rewrote email sending code to require SMTP credentials to do so.
  - Use .env file for local SMTP sending config in development

## 5.0.0
* By default, responses are no longer viewable / editable
  - Added responseCanViewByLink and responseCanEditByLink in formOptions to control this setting. Also made handling of form submission authorization more consistent.
* Add CI/CD for automatic deployment
* Fix backend files for local setup
* Dashboard functionality - support "template" and "form" pages
* Admin: allow adding keys when editing a response
* Add `submitOptions`, which is passed in when calling the form submit endpoint. Setting `submitOptions.sendEmail` to `false` allows form submission without sending a confirmation email (not visible to user yet)

## 4.1.2-4.1.5
update and test azure pipelines

## 4.1.1
Small fixes / dev changes:
* Continuous integration and deployment
* Use cff:removed widget to hide non-needed fields
* Begin dashboard functionality

## 4.1.0
* Add tag feature: Form editors can now edit tags for each form, and there is also a search bar at the top of the form admin list page. You can search for forms using their names or tags. Note that tags are public!
* Fix pagination for aggregate group view -- previously, if there were more than 20 items, it would just truncate the table.
* Fix vulnerabilities and some package cleanup

## 4.0.1
* Fix: Return "" instead of None if ccavenue key is undefined

## 4.0.0
* Add more options to `paymentInfoItemPaidSum`. `queryValue` is now an object including `names`, `startDate`, and `endDate`. The latter two can be used to filter payments that are within a specific time range.

## 3.35.0
* For a response table column, allow for summing up of paid paymentInfo items by specifying the `queryType` to `paymentInfoItemPaidSum`.
* Fix bug where id's of table headers were not set properly, which could cause a table column accessor bug.

## 3.34.0
* Allow for the use of custom expressions in response table headers by specifying the `queryType` to `expr` and the expression value in `queryValue`.

## 3.33.0
* Allow calculation of displayed fields in response tables. This uses the custom mongodb aggregate queries.

## 3.32.0
* Support `replyTo` attribute in confirmation emails

## 3.31.0
* ccavenue sub_account_id integration

## 3.30.0
* Expression parser: fix parsing issue with cff_nthOfNextMonth that results in the wrong dates being calculated
* Fix js vulnerabilities

## 3.29.0
PayPal IPN fixes:
* silently append ipn value, don't raise exception, upon ipn error. This way, paypal
accounts won't get emails saying that "IPN failed"; instead, we handle these errors
by just logging them in our system and adding them to payment_trail.
* Append IPN error when receiving IPNs for subscription events (such as subscr_failed, subscr_signup)

UI:
* Center login text in "Login" screen
* Allow `calculateLength` attribute in headers for data_options.

## 3.28.0
* Add cff_createdBetween to restrict payment items by deadline
* Allow specifiedShowFields to override uiSchema with keys with a CFF_uiSchema prefix

## 3.27.0
* Add right-click context menu for responses view (#199)
* Add form summary page (#208)
  - This also requires a db change that adds the amount_paid_cents and amount_owed_cents fields (lambda/tools/addPaymentFields.py)

## 3.26.1
* Fix: Add React Table css to all pages

## 3.26.0
* Admin Manual Payment:
  - Show confirmation email template dropdown only when "Send confirmation email" is checked
  - Create endpoint "responses/{responseId}/email" which sends out a confirmation email / receipt. This can now be accessed by checking the "Send confirmation email" checkbox.
* IPN handler fixes:
  - Fix: IPN handlers not working with non-ascii characters (#204)
  - Fix: don't error when handling certain subscription events ("subscr_signup", "subscr_cancel", "subscr_eot" types) (#197)
* Fix bug in which responses table would error when no confirmationEmailTemplates are defined
* Performance enhancements:
  - Code splitting
  - Lazy importing of modules
* Fix formpage padding / spacing issues

## 3.25.0
* Add way to select email templates for manual payment entry and define them
  in `formOptions.confirmationEmailTemplates` (#203)
* Address autocomplete:
  - Add `cff:locationType` in `ui:options` to specify the types of locations that show up ("cities" or "addresses")
  - Allow multiple autocompletes on a page at once
* Fix padding of oneof widget
* Form page: In edit mode for admins, change wording of button from "Admin edit response" -> "Edit"
* Upgrade eslint to fix vulnerabilities

## 3.24.0
* Feat: Multiple currency support with `paymentInfo.currencyTemplate` (#181)
* Chore: Add tests for CCAvenue form submit

## 3.23.1
* Fix: Fix issue in which an older version of rjsf was accidentally deployed in 3.23.0
* Doc: Reorganize and update documentation

## 3.23.0
* Feat: Add organizations feature, which restricts form creation only to certain users. This fixes a security issue, because otherwise anyone could sign up with an account and create a form (and thus send confirmation emails from one of our verified email addresses).

* Fix: Use MongoDB Atlas for Beta deployment
* Chore: Format Python files using Black

## 3.22.0
* Feat: Create a permission called "Responses_AddPayment" that allows one only to add payments (previously, one had to have "Responses_Edit" permission to do so) (#171)
* Feat: Add a new UI for sharing functionality using react-select (#171)
* Feat: For the admin manual payment interface, added a "Notes" field (#171)
* Feat: Add sticky footer with "Help" link on the admin page (#166)

* Fix: When submitting a manual payment through the admin interface, default the "send confirmation email" button to false (#171)

## 3.21.3
* Fix: Make sure paypal IPN handler doesn't crash when no txn_id field is defined.
* Fix: better IPN error message when emails don't match.

## 3.21.2
* Fix: Make sure FormResponseCounter entries are stored in the same collection as everything else
* Fix: Change rjsf patch to fix array num items bug (#162)
* Feat: add responseSaveEnabled feature to formOptions (not functional yet)

## 3.21.1
* Feat: AddressAutocompleteField now supports `ui:placeholder` attribute
* Feat: Upgrade to rjsf patch version for allOf support
* Feat: Show error list on top, and scroll to top, on error

* Fix: Don't cap the width of "total" column on payment table (#159)

* Chore: Speed up lambda by increasing memory from 128 MB -> 1024 MB

## 3.21.0
* Feat: Add address autocomplete field `cff:addressAutocomplete` (#151)
* Feat: Removed the "Checkin" button from the menu (#140)
* Feat: Changed loading icon (#155)
* Feat: Show "total" column in payment table for item-level totals (#157)
* Feat: Allow confirmation "Please scroll down" message to be overriden by `formOptions.messages.confirmationPageNoticeTop`

* Fix: Fix anonymous users not redirected to login (#139)
* Fix: Autopopulate fixes (#136)
* Fix: Speed up form list clicking / right clicking (#148)
* Fix: Prevent refreshing the page after a form is deleted (#153)

* Chore: merge backend code into `lambda` directory of a single `CFF` repository.
* Chore: add backend tests to CI pipeline
* Chore: Use aws-amplify smaller packages to decrease bundle size and fix warnings

## 3.20.0
* Feat: Add "counter" functionality which allows for generating numeric, consecutive ids for each response based on its order of creation.
* Feat: Add "format_date" template filter for jinja templates (used in confirmation emails) to show dates in a locale-friendly manner.
* Fix: UI changes for confirmation page to show nice Bootstrap alerts for messages, so that they are more prominent.

## 3.19.0
* Fix: upgrade rjsf to 1.7.0
* Feat: add cff:infoboxSelect widget and add it by default into the array num items widget

## 3.18.1
* Fix: Make paymentInfo description field have full width
* fix: add null checking for cff_addDuration and cff_nthOfNextMonth

## 3.18.0
* Feat: Add "adminFields" property, which contains paths of fields that are hidden from respondents, but can be edited by admins.
* Feat: add "postprocess" option to formOptions which allows certain fields (such as order id, deadlines), to be calculated after the form has been submitted.
* Feat: Add cff_today and cff_addDuration and cff_nthOfNextMonth to expression parser (backend only).
* Feat: add "expr" option for patches
* Feat: paymentInfo.description now accepts a jinja template for greater customizability
* Feat: When an admin views a form in "view mode", a button lets them change to "edit mode".
* Change: Admins with Edit_Responses permission can now directly edit a response through the form edit response endpoint.
* Fix: fix race case with responses loading, which allows for email to be greyed out when autopopulated.
* Fix: Numeric/non-numeric calculations for calculate_price

## 3.17.0
* feat: allow "sm" property to be specified in theme to make all inputs sm-size.
* fix: Remove border for array numitems select widget, make spacing smaller around it.

## 3.16.4
* fix: don't scroll to top when form errors happen

## 3.16.3
* Fix: don't make omitExtraData and liveOmit always true

## 3.16.2
* fix: don't mutate data when performing calculate_price

## 3.16.1
* fix: fix patching with unwind

## 3.16.0
* feat: add editSchema option, which allows one to specify inline editing on the responses admin view.
* fix: handle countArray and getdiff cases when arguments passed to them are null/empty/nonexistent 


## 3.15.2
* feat: add support for cff_countArray in expressions, allowing for nesting of expressions to be applied to each object in an array.

## 3.15.1
* fix: calculate installments properly from multiple totals

## 3.15.0 
* Feat: Allow form sharing by entering email addresses
* Feat: Add a DynamicEnumField which allows changing of enum values based on form data.
* Admin FormList UI improvements
* Admin ResponseDetail UI improvements - tab view with more information quickly available.
* Feat: Add cff_yeardiff function to expressions, which calculates the time delta in years between two dates. (Note: this change ended up dropping support for expressions with quotes, such as `race:'Half Marathon'`.)
* Feat: Add new endpoint to edit admin_info, called `/responses/{responseId}/admin_info`. Only users with the permission `Responses_AdminInfo_Edit` can modify this.

* Fix: fix the AutoPopulateField to work properly now. It also caches data from an endpoint in sessionStorage, and automatically sorts its items alphabetically.
* Fix: refactor, fix glitchiness with context menus
* Fix: Remove users from share screen when they no longer have any permissions
* Fix: fix padding on top and bottom of AutoPopulateField and form in general
* Fix: upgrade to new Monaco version to slim bundle size
* Fix: Decrease height of top admin bar
* Fix: Improve admin UI to make it more compact
* Feat: Allow admins to add a new payment without selecting "Send confirmation email"
* Fix: Always round up prices to the next highest cent (for example, 33.3333 -> 33.34)

## 3.14.0 
* Feat: Send backend confirmation emails whenever a successful payment has been received, even if the value for PAID is not true. This means that it will be useful to show the payment status and/or payment tables in the confirmation email templates so that the user knows if they have fully paid or not. This also means that emails will be sent out in case of a refund.
* Feat: Add a new "installment" payment item type, whose value of `installment` is equal to `true`. This means that the payment will not be factored in to the total, and it will be evaluated only in the client-side to show recurring payments for the user. 

* Chore: switch back to `expr-eval`'s latest version, which has the bugfixes patched.
* Chore: Add prettier and eslint as pre-commit hooks, format all files.
* Fix: Upgrade rjsf to fix some issues
* Fix: in the AutoPopulate field, make the embedded form use a `<div>` tag instead of a `<form>` tag. This removes the non-HTML-compliant "form-in-form" warning.
* Fix: format recurring payments in the payment table in a human-readable format, such as "$10 every month for 10 times"
* Tests: Fix failing tests from before, which were failing due to the new "remove" buttons not containing the text "remove".


## 3.13.3 (7/9/19)
* Fix payment array calculations with multiple, repeated subtractions, such as `"$participants - $participants.age:1 - $participants.age:2 + $participants - $participants.age:1 - $participants.age:2"`.

## 3.13.2 (7/9/19)
* Fix calculation of payments with nested objects & multiple subtractions, i.e., `"$participants - $participants.age:1 - $participants.age:2"`. This involved changing the logic and also adding a patched version of expr-eval (@epicfaace/expr-eval@1.2.3).

## 3.13.1 (7/8/19)
* Fix calculation of payments for formulas with nested objects in it, of the form `"$participants - $participants.age:1"`. This fix also fixes the calculation of formulas with values equal to a number, i.e. `$participants.age:1` checks when `age` is equal to 1, whether it's a string or an integer.

## 3.13.0 (7/7/19)
* Set up Google Analytics with Redux Beacon
* Require form to have a successor (`formOptions.successor`) in order for another form to use it as its predicate.
* Enhancement: Allow `ui:cff:arrayNumItemsTitle` to be specified in the schema (to allow for dynamically changing this value), in which case it overrides that specified in uiSchema.
* Enhancement: Allow loading custom fonts from Google Web Fonts through `formOptions.theme.fonts`, and adding custom styling to the form through `formOptions.style.root`.

## 3.11.6 (6/30/19)
* fix: allow amount expressions with array expression conditions in which items are not object, i.e. "sponsorshipAnnadanam:300".

## 3.11.5 (6/30/19)
* fix: upgrade to rjsf patch which allows for minimum values for integers
* fix: properly align infobox title description (i) icon

## 3.11.4 (6/28/19)
* allow for style tags in html descriptions by using css inlining

## 3.11.3 (6/28/19)
* fix: remove bar

## 3.11.2 (6/28/19)
* fix: allow multiple infobox radio widgets on one page

## 3.11.1 (6/27/19)
* Add cff:radioDescriptions option
* Fix: when email is confirmed and there is an error, redirect to login page instead of showing an error page.

## 3.11.0 (6/23/19)
* Add predicates feature.
* Add `formOptions.omitExtraData`.
* UI improvements for infobox radio widget.
* Upgrade to new rjsf patch to fix dependency update issue.
* Handle paypal ipn refunds

## 3.10.1 (6/19/19)
Backend fix only:
* Fix nested price issue: return 0, don't crash, when getting the nested price of undefined. (https://github.com/epicfaace/ccmt-cff-lambda/pull/4)

## 3.10.0 (6/18/19)
Features:
* Add infoboxRadioWidget which allows for a description to be shown on hover of an "i" icon.

## 3.9.0 (6/16/19)
Features:
* Add conditionalHiddenRadio widget -- which is hidden if it is set to a constant value and readonly.
* Add autoPopulateField -- which fetches data from a particular endpoint and displays it.
* Allow a "number of elements" field to be selected, which then sets the number of elements in an array.
Bug fixes:
* Fix form submissions closed blank screen issue
* Upgrade rjsf to patch release, to fix various dependency and dependency default issues.
Dev:
* Use webpack-dev-server for builds

## 3.8.0 (5/22/19)
* Add "view-only" option for forms -- can be created by including `{{view_link}}` in the confirmation email template.
* Add CCAvenue integration.

## 3.7.1 (4/27/19)
* Checkin: show full id and age

## 3.7.0 (4/27/19)
* Checkin: Have a "show unpaid" option, accessible only to response editors, allowing one to search/checkin unpaid responses.

## 3.6.9 (4/26/19)
* Checkin: Allow response editors to edit responses from the checkin tab

## 3.6.8 (4/26/19)
* Checkin: Add gender to checkin

## 3.6.7 (4/26/19)
* Backend fix: use raw mongo query to get responses to fix speed issue

## 3.6.6 (4/26/19)
* Bug fix: fix type so code compiles

## 3.6.5 (4/26/19)
* Bug fix for checkin: fix InlineEdit view, fix permissions check
* Form Render viewpoint now returns cff_permissions

## 3.6.4 (4/26/19)
* Disable autocomplete for form checkin
* Restrict form checkin and mobile menu only to people with permissions
* Performance: return less fields in responses list endpoint

## 3.6.3 (4/26/19)
* Backend only fix -- Fix another issue with accounts only having Responses_CheckIn permissions unable to checkin

## 3.6.2 (4/26/19)
* Form Checkin enhancements:
  - Autocomplete
  - Inline bib edit
  - Fix "check in all" button by adding a batch edit option on API
  - Allow queries with multiple words
  - Allow search_by_id option to speed up queries
  - Fix issue with accounts only having Responses_CheckIn permissions unable to checkin

## 3.6.1 (4/25/19)
* Form Checkin enhancements:
  - Add "Check in all" button
  - Color enhancements
  - While scrolling in mobile, make search bar sticky.
  - Fix search by object id.
  - Filter responses in checkin view to only paid responses.

## 3.6.0 (4/19/19)
* Form Search and Checkin functionality
  - /responses endpoint now supports a ?query= parameter for searching, which can be configured by the dataOptions.
  - Added a form view.
* Admin: Disable context menu and show more mobile-friendly buttons for smaller screens
* Admin: Fix editor height bug on mobile/Safari
 
## 3.5.4 (4/15/19)
* Bug Fix: Allow coupon codes for partial payment to propagate over to PayPal.

## 3.5.3 (4/11/19)
* fix (om run): fix half marathon age validation bug

## 3.5.2 (4/9/19)
* fix: fix modification button

## 3.5.1 (4/9/19)
* Fix modification bug

## 3.5.0 (4/8/19)
* Allow closing submissions and response editing with responseSubmissionEnabled and responseModificationEnabled options in formOptions.
* Admin: Add "Delete" functionality for a form.

## 3.4.2 (4/5/19)
* Bug fix: fix problem where "coupon code maximum reached" message would come even in a normal form submission.

## 3.4.1 (4/5/19)
* Responses Table: show AMOUNT_PAID column by default on responses view

## 3.4.0 (4/5/19)
* Form Responses: Allow header values to be concatenated with no space (with the `noSpace` option) and also have constant values.
* Add support for coupon codes with limits, with the used coupon codes stored in the `couponCodes_used` property on a Form.

## 3.3.4 (3/31/19)
* Fix - fix CSS selectors.

## 3.3.3 (3/31/19)
* Hotfix to fix cloudfront caching.

## 3.3.2 (3/31/19)
* Forms: Fix bug again in which "col" classes are not respected properly

## 3.3.1 (3/31/19)
* Forms: Fix bug in which "col" classes are not respected properly

## 3.3.0 (3/31/19)
* Forms: upgrade react-jsonschema-form, fix column width logic
* Form Admin: show loading spinner when form is loading (#51)
* Form Admin: highlight rows when clicked, show last modified and last created dates, move action buttons to right click context menu (#35)
* Form Admin: show form page menu when any of the pages (edit, responses) are viewed, for easier navigation (#42)
* Form Edit: Use Monaco editor for better admin editing experience (#53)
* Google Sheets: Add showCountTotal option to show total in aggregation (#52) (lambda js)
* Backend: allow forms to have $ref's nested in lists; return date_created and date_modified from form list endpoint.


## 3.2.1 (3/22/19)
### Lambda js
* Allow export to multiple spreadsheets. Just specify multiple options with `{"value": "google_sheets"}` in `dataOptions.export`.
  - This was done in the context of Om Run needing to export *just* a summary, which is in a separate Google sheet than the Google sheet for all the participants.
* Fix a small bug in which creating a new google sheet fails because the sheet delete request was not performed after the sheet insert request.

## 3.2.0 (3/19/19)
### Backend python
* Upload data url images to s3 on backend. S3 object key will be stored instead of the entire data url. This is only currently enabled when response.value has an array with key "images", and is applied to each element of the "images" array.
### Frontend
* When a modifying a response, show "File uploaded." when a file is uploaded to s3 rather than crashing.

## 3.1.0 (3/14/19)
### Lambda js
* Add aggregate functionality. Add a dataOption view such as:
* Keys can be escaped.
* Update jest.

## 3.0.0 (3/14/19)
### Frontend
* Fix bug -- having spaces in the key name makes it not show up in the response table. This introduces a **breaking change**; if you earlier had a column name in `dataOptions.views` that had spaces in it (such as `"name.first name.last"`), you will need to change it to an array (`["name.first", "name.last"]`).
* Custom Om Run logic - show validation error when age < 13 and "half marathon" is selected
* Show PAID, NOT PAID, PARTLY PAID
* Add "cff:confirm" widget which allows a field (such as an email) to be "confirmed".
* Fix alignment of "Remove" button in arrays

## 2.4.1 (3/2/19)
### Backend
* Minor fixes: allow format_payment in the email confirmation to accept a string, not just a number (so that it can be used with amount_paid).

## 2.4.0 (2/26/19)
### Features
* Allow responses to be modified by clicking a link.

### Frontend
* "sameAs" form field functionality
* Remove "cff:roundOff" widget
* Form Edit: give jsoneditor fixed height to fix height bug
* Form Edit: improve form edit experience with tabs, splitter layout

### Backend
* Fix tests
* Upgrade chalice
* Backend for anonymous modification of responses

### Lambda JS
* Aggregation functionality for google sheets export

## 2.3.8 (2/18/19)
Backend python lambda:
* /authorize endpoint now supports JSON body with two keys, "app_client_id" and "token". This will validate the specific JWT which belongs to the specific client id.

## 2.3.7 (1/15/19)
Lambda js:
* Add "find closest location" functionality for google sheets export

## 2.3.6 (1/14/19)
Front end, back end, and lambda js:
* lambda js runs every hour and exports to google sheets
* Google sheets export functionality
* Back end - allow for "admin_info" attribute on Form model

## 2.3.5 (1/12/19)
Front end and back end:
* Remove "Form Summary" button
* Add "Form Duplicate" button (and backend functionality to do so)
* Fix spacing for objects, i.e.:
![image](https://user-images.githubusercontent.com/1689183/51076186-ffb53480-1649-11e9-8800-275997458d71.png).

## 2.3.4 (12/14/18)
Front end only:
* Fix bug: make forms without ui:cff:validate defined still work.
* Remove error alerts.

## 2.3.3 (12/13/18)
Front end only:
* Add ui:cff:validate option which allows for custom validation. Example: 
```
  "ui:cff:validate": [
    {
      "if": "phone == 1231231233",
      "then": "Phone Number cannot be '1231231233'."
    }
  ]

  "ui:cff:validate": [
    {
      "if": "age < 13 and race:'Half Marathon'==1",
      "then": "Participants under 13 cannot register for Half Marathon."
    }
  ]
```
* Alert all errors that come so it's obvious.

## 2.3.2 (10/21/18)
Front end only:
* Remove parent iframe login action to temporarily disable wordpress login integration

## 2.3.1 (10/20/18)
Front end only:
* Fix logo

## 2.3.0 (10/2/18)
Front end only:
* Integration with wordpress login through iframe messages.
* Fix bug: allow sign in when email has capital letters in it
* Fix bug: show the bottom-most "add user" row in the Share page.

## 2.2.5 (9/20/18)
Back end only:
* Fix bug: don't error on subscription signups for the IPN handler
* Add various tests and utils

## 2.2.4 (9/13/18)
Front end only:
* Make emails lowercase when signing up and signing in. (This requires a backend fix which lowercases all emails -- see tools/lowercaseUsers.py)
* [Auth] Fix bug -- allow user to sign up with lowercase email

## 2.2.3 (9/12/18)
Front end only:
* [Responses] Display arrays and filter them properly
* [Form] Make add buttons small again

## 2.2.2 (9/5/18)
Front end only:
* Fix bug: recurring payments in paypal now will actually recur.
  - srt is always set to 1 so recurring payments will always recur by default
  - recurrenceTimes can be specified to set the srt variable, which gives the max number of recurrence times (for example, a monthly subscription for a year would give you srt = 12).

## 2.2.1 (8/21/18)
Front end only:
* [Groups] Fix bug: showing random data for groupAssignDisplayModel when it should be blank

## 2.2.0 (8/21/18)
Front end:
* [Responses] Group assign functionality
* [Responses] Response detail now opens up in a modal, updates table when response updated.
* [Responses] Properly format booleans and fix filter by paid

Back end:
* Add group edit endpoint
* Return edited form when editing it.
* Allow setting a null value when editing a response with PATCH.

## 2.1.10 (8/18/18)
Back end:
* [Payment] Fix payment randomly appending lists, by upgrading chalice and pymodm

## 2.1.9 (8/18/18)
Front end and back end:
* [Responses] Let custom payments be entered with a specified date. Payments now have date, date_modified, date_created to allow for this.
* [Refactoring] Some refactoring and better tests of response table.
* [Refactoring] Add webpack runtime chunk to speed up loading times.

## 2.1.8 (8/13/18)
Front end only:
* Allow custom views to be shown in the response table, such as a children view, parents view, etc. with custom columns shown in each. Custom views are specified in formOptions.dataOptions. See docs/dataOptions.md for details and examples.
* When filtering for responses in the response table, search with in any position in the word.
* CSV export gives a meaningful file name with form name + timestamp. Uses papa parse library instead of react-csv.
* Format dates nicely on responses page.

## 2.1.7 (8/11/18)
Front end only
* Fix responses table race condition error -- load the form first, then load the responses for that form.

## 2.1.6 (8/11/18)
Front end and back end
Front end:
* Fix bug: remove default dummy payment history of $123 and $223 shown on response detail.
* Use redux for a lot of loading data on the admin pages.
Back end:
* Fix critical [bug](https://jira.mongodb.org/browse/PYMODM-107) in which payment_trail, update_trail, payment_status_detail, and email_trail for a single response picked up random entries from other responses, by initializing these fields to empty list manually. The data cleanup for this cleaned up payment_trail and payment_status_detail and just removed all existing update_trail and email_trail and is located in tests/tools/SpuriousPayments.py.

## 2.1.5 (8/6/18)
Front end and back end
* Allow form editing functionality, more features on response detail view page.
* Show payment history on response table and allow admins to edit it
* Response delete functionality

## 2.1.4 (8/4/18)
Front end and back end
* Integrate login with wordpress; when wordpress user is signed in and views CFF through an iframe, they can access CFF as well (see ccmt-cff-wp-plugin and gcmw-plugins/wp_gcmw_cognito for more information)
* Add /authorize endpoint on REST API. This is used to validate a JWT and return the response (irrespective of client ID).
* Remove "amount already paid" when no amount is paid
* Refactor paymentInfo_owed and paymentInfo_received objects' structure to be more clear.
* Properly turn off autocomplete.
* Fix redirect URL on paypal classic.


## 2.1.3 (7/29/18)
Back end only
* Fix render response endpoint
* Allow user to go back and edit form when loginRequired is false

## 2.1.2 (7/29/18)
Back end only
* Fix form permissions endpoint by removing center.
* Store txn id in payment_status_detail
* loginRequired must be true to use the /forms/{formId}/response endpoint.

## 2.1.1 (7/28/18)
Front end only
* Use correct, production user pool on the production website.

## 2.1.0 (7/28/18)
Major changes: (CMA Marietta and Chinmaya Ramdoot registrations)
* Log in and edit response functionality for forms, with loginRequired 
* Add subscription feature for paypal
* Use dev and prod user pools, JWT authentication
* Confirmation email for user pools has link that redirects back to the form
* Add logic for update (different than old CFF, no pending_update here.)

## 2.0.18 (7/21/18)
Frontend only
* Add fetch polyfill again to fix admin page on IE
* CSS changes
* Remove unneeded 

## 2.0.17 (7/21/18)
Frontend only
* Use custom UI for authentication
* ui:cff:submitButtonText can be used to customize submit button text
* Fix response table view, show all properties & show them properly
* Fix array field rendering issues - when minItems is 0, it should show an "Add" button
* Add ui:cff:arrayItemTitles option to customize titles for array

## 2.0.16 (7/19/18)
Frontend only
* Change structure of specifiedShowFields to have paths as keys, such as ```{
    "title": "New",
        "properties.parents.minItems": 5
	  };```

## 2.0.15 (7/19/18)
* Simplify response table logic, dataOptions specifies the exact columns shown
* Show login screen when formOptions.loginRequired is true
* Don't display user ID on greetings bar
* Add functionality to override schema with specifiedShowFields
* Add fetch polyfill for IE compatibility

Backend:
* Remove numpy and pandas
* Create default form which actually works.

## 2.0.14 (7/14/18)
* Fix bug - forms breaking for unauthenticated users
* Fix shown url on FormEmbed page

## 2.0.13 (7/13/18)
* Allow adding a user by ID to share
* Change prefix for cff_permissions to cm:cognitoUserPool:[]

DB:
* Allow user to add a user to get access to a form.
* Use db credentials from SSM instead of hard-coding
* Add email_trail whenever an email is sent.

## 2.0.12 (7/12/18)
* Add additional options for centers on signup

## 2.0.11 (7/12/18)
* Show identity pool ID, not user pool ID, once user has logged in.

## 2.0.10 (7/11/18)
* Each form now has a proper html title!
* Checkbox moved to bottom (instead of aligned at the top)
* Remove html5 validation from forms
* Remove social signin, login only through userpool
* Disable amplify localStorage to fix login issues.
* Show your cff cognito identity ID when logged in.
* Allow cff:smallTextbox widget to be used for an "other" text box field
* Loading animations on login / credentials fetch.

## 2.0.9 (7/4/18)
* Deployment process for dev involves a timestamp, so version number doesn't need to keep being incremented.
* When a payment method is selected, hide the other payment methods.
* Fix manual_approval payment method on backend (which sends a confirmation email).
* change "Pay Now" to "Payment"
* Fix name and description not showing up on boolean fields and array fields.
* Fix "paid" display on response table
* Separate custom form into a separate component (from the FormPage) so it's easier to test in isolation
* Authentication tweaks (make code work with user pool login)

## 2.0.8 (6/30/18)
* Use CosmosDB for backend
* Custom authentication UI
* Live form preview while editing
* Use Redux
* Lots of other changes.

## 1.3.26 (5/20/18) - backend 1.1.12
* Allow form structure "v2": allow uiSchema and schema to be specified directly within the form itself.
* Support free forms (no payment required)
* Bug fix: Export CSVs with newlines in them.
* Feature: Add "Loading" animation for ManualApproval component.

* In the form database entry, formOptions can now have successMessage, confirmationEmailInfo, showConfirmationPage (to skip confirmation page), paymentMethods etc.
* Note: formOptions is referred to as "schemaMetadata" in the code
* Note: v2 does not work with paid forms yet, only free forms.

## 1.3.25 (5/19/18)
* Quick fix on the js file names.

## 1.3.24 - backend 1.1.11 (5/19/18)
* Fix bug where opening pages in new tab would crash
* Better signed in UI (don't use greetings bar, it's all in the footer)
* Upgrade aws amplify.
* Add "auto_email" and "manual_approval" payment option

## 1.3.23 (5/10/18) - backend 1.1.9
* Allow "description" to be provided in paymentInfo which overrides default text after submit.

## 1.3.22 (5/5/18)
* Fix form embed url
* Show pagination in checkin table

## 1.3.21 (5/4/18)
* Add form embed page.
* Form detail page shows other form buttons on top

## 1.3.20 (5/2/18) (backend 1.1.8)
* CCAvenue integration!
* Fix scroll to top upon form submit.
* format payment properly with different currencies

Other:
* Fix paypal return urls and modify links to reflect parent url of iframe
* format payment properly with different currencies
* bug fix: response detail works when there are no participants column
* Change processing of paymentMethods (filling in billing_name etc. from forms) to server-side from client-side
* Client reads in paymentMethods from server (it can contain things such as the ccavenue hash)
* dev server runs on port 80
* **Note**: Some ccavenue payment information (such as secret key) is stored per-center in the centers table (for eventual migration of all payment info to center table); see docs/ccavenue.md for more information.

## 1.3.19 (4/28/18) (backend 1.1.5)
* dataOptions.columnOrder by default includes *only those columns*, to include the rest of the columns, use a wildcard:
["name.first", "name.last", "email"] -- only 3 columns
["name.first", "name.last", "email", "*"] -- 3 columns + more.
* Specific page for check in, with form permission Responses_CheckIn
  - Don't show entire response, unwind tables, or download csv in check in page.
  - Show "None" in check in detail table if empty value.
  - dataOptions.checkinTable contains info for check in, including the "omrunCheckin" option.
* Dev: Use TDD with Jest

## 1.3.18 (4/28/18)
* Allow paypal cancel url to reflect iframe's parent, not cff url.
* Bug fix: Form checkbox and round off are now required when specified.

## 1.3.17 (4/28/18)
* Change ui:cff:backgroundColor to ui:cff:background so it allows for images, etc. Ex:
```    "ui:cff:background": "url('https://i.imgur.com/FlP2bNx.png')",```
* Allow for custom html in titles, so you can add images.
* Default loading background is white

## 1.3.16 (4/27/18)
* Swap center name in form url: /CCMT/forms/{formId}

## 1.3.15 (4/27/18)
* Bug fix: show required properly
* Fix admin urls' redirecting when refreshed.
* Bug fix: Disable type overriding in schemas
* Include center name in form URL. /forms/CCMT/{formId}

## 1.3.14 (4/27/18)
* Base target to allow iframe embedding links to open in parent
* Change colors of HM/10K for bib check in.
* Nice CSS for standalone form view (looks like a form page).
* Allow background color of standalone form view to be controlled by ui:cff:backgroundColor.
* Fix gulp serve issue.

## 1.3.13 (4/27/18)
* Remove logs that broke code.

## 1.3.12 (4/27/18)
* Allow arbitrary forms to be rendered on CFF website, too (and included as an iframe). Thus, move urls: https://cff.chinmayamission.com/admin and https://cff.chinmayamission.com/form/asjdlajskdl&specifiedShowFields={"title":"HU"}
* Build two versions of the script -- app.js (for wordpress) and app.[version].js (for CFF website), fixing cache problem for wordpress websites.

## 1.3.11 (4/27/18)
* Bug fix: Don't check them in by default!
* Disable hard source webpack plugin for now, doesn't work.

## 1.3.10 (4/27/18)
* Properly override top level required field in schema
* Only show checkin information if "omrunCheckin" is true.
* Add response checkin functionality (can only do if you have response edit permissions.)
* Bring the columns in columnOrder to the front; still keep the other columns though.

## 1.3.9 (4/26/18)
* Hide payment info table if no rows found.

## 1.3.8 (4/26/18)
* Add onChange handler back again, so payment table updates in real time.
* Fix jest tests

## 1.3.7 (4/26/18)
* Fix IE 11 issue by referencing "json-schema-deref-sync/dist" for now.
* Fix calculation of PAYMENT_INFO_ROUNDOFF, etc.

## 1.3.6 (4/23/18)
* Make the form work on Internet Explorer by compiling code for older browsers (actually, this doesn't work)
* Remove some old code / clean up code.

## 1.3.5 (4/22/18)
* Fix bug: If specified show fields is not specified, it should still work.

## 1.3.4 (4/22/18)
* Set ui:cff:updateFromField's value to ui:cff:defaultValue if necessary
* Specify JSON to override schemaModifier in data-ccmt-cff-specified-show-fields (lets you create custom forms with 1 participant, 2 participants, or hidden stuff, etc.)

## 1.3.3 (4/22/18)
* Add updateFromField option (see docs/updateFromField.md)
* Show headers on each row of array field by default
* Upgrade RJF to 1.0.3 (from 0.5!) *BREAKING CHANGE* - uses ajv json validator, so required has to be an array, not a boolean anymore.

## 1.3.2 (4/21/18)
* Make minItems work in schemaModifier
* Add some jest unit tests
* Refactor some of schema expression parsing code
* In deploy.py script: Use cloudfront invalidations instead of versioning script names, so that script urls are constant (for use with wordpress plugin)
### 1.3.2-1


## 1.3.1 (4/21/2018)
* Package webpack into only two js files (so it works with forms on the WP plugin).
* Add footer to admin page.

## 1.3.0.3 (4/20/2018) (backend 1.1.0)
* Output files have version numbers in their names.
* Created a deploy script which automatically uploads to S3 and cloudfront.

## 1.3.0 (4/20/2018) (backend 1.1.0)
Form Page:
* Allow form submit page to work with chalice API

Admin Page:
* hide entire form list on detail view; add back button
* Fix styling, remove links for disabled buttons on admin console.
* Add form edit page
* Select first center by default upon logging in.
* Add "share" page with the ability to modify form permissions.

Other fixes:
* Permissions format changed: {userId: {perm1: true, perm2: true}, ...}
  - Permissions also renamed to be more consistent: ex ResponsesEdit --> Responses_Edit
* Bug fix: fix minifying of js
* Small fix: sandbox mode now depends on production or not (production = no sandbox, no production = sandbox)
* New ipn notification url: /responses/{responseId}/ipn


## 1.2.8 (4/12/2018)
* Fix login issue -- login works without having to refresh now.

## 1.2.7 (4/12/2018)
* Create new form button (from existing schema)
* Create user entry in database with info on new login.

## 1.2.6 (4/10/2018)
* Make responseEdit button go to proper page.
* Re-add numeric id.
* Code to auto-assign bib numbers (commented out for now.)
* Fix filter bug with numbers.

## 1.2.5 (4/9/2018)
* fix duplicate data call in ResponseSummary
* Remove temporary "numeric id" that was being generated.
* show unwind tables using react router
* dynamically load each response, add a mock checkbox to "check in".

## 1.2.4 (4/6/2018) (chalice backend 1.0.4)
* webpack minify css and put in a separate file
* Highlight responses / summary buttons so you know what page you're on, and grey out buttons you have no permissions to.
* show cff:cognitoIdentityId: before id
* graceful error handling on session expire
* Generic data loading HOC for all views (DataLoadingView)
* Responses search is case insensitive.
* Responses edit page -- allows things such as bib assignment from admin. Users of this must have the `ResponsesEdit` permission.

## 1.2.3 (4/2/2018)
* Refactor loading, proper error handling for responses page
* Better error handling
* Remove aggregate info from responses table


## 1.2.2 (4/1/2018)
* React router
* Response summary page
* Better styling changes of admin page, with bootstrap!

## 1.2.1 (3/31/2018)
* Fixed bug -- shows access denied screen properly.
* Add hashes to prod HTML page and js files.

## 1.2 (March 31, 2018)
* This is now split into a standalone site, which uses chalice backend ("standalone" branch).
* Permissions: ViewResponses

## 1.1.17 (JS uploaded March 27, 2018 2:26 PM PST)
* Hide description for hidden fields (hidden by ui:cff:display:if:specified)

## 1.1.16 (JS uploaded March 27, 2018 11:39 AM PST)
* Server version: 1.1.18
* WP Plugin version: 1.1.12
* *Main features*: manual entry, conditional display with ui:cff:display:if:specified
* Hide label when ui:hidden widget is used (to make ui:cff:display:if:qs work properly).
* Allow authKey and specifiedShowFields to be specified in the form div (see documentation/permissions.md for more details)
* Change ui:cff:display:if:qs to ui:cff:display:if:specified (these fields are only shown whenever they're included within specifiedShowFields).
* Show schema and schemaModifier IDs in form edit page
* Fix issues with paymentInfo_received shown in table, so manual entry works.

## 1.1.15 (JS uploaded March 26, 2018)
* Server version: 1.1.17
* Implement ui:cff:display:if:qs.
* This allows conditional visibility of manualEntry:
```
{
  "title": "Method of Payment",
  "enum": ["Cash", "Check", "Square"],
  "ui:cff:display:if:qs": "manualEntry"
}
* And of couponCodes.
```

## 1.1.14 (JS uploaded March 26, 2018 8:04 AM PST)
* Fix "$contact_name" etc. showing up in paypal screen; get the proper values pre-filled on guest checkout.

## 1.1.13 -- (client side only) (JS v 1.1.13 - JS uploaded Mar 23, 2018 5:40 PM PST)
* Show round off, donation, and other columns in response table.

## 1.1.12 -- (client side only) (JS v 1.1.12 - JS uploaded 3/21/18 6:20 PM)
* Fix css rendering of button height.
* Allow add button and remove button text to be modified in the schemaModifier:
```json
"participants": {
  "type": "array",
  "items": [...],
  "ui:cff:addButtonText": "Add the person",
  "ui:cff:removeButtonText": "Remove! Custom text!",
}
```
* Add an http://localhost:8000/index-prod.html page for development to test production versions of js
* Reference dist folder of json-deref so that backticks don't show up (problem in IE)
* Add babel-polyfill and transpiling to allow it to work in IE 10+.

## 1.1.11 (client side only) (JS v1.1.11, WP PLUGIN v1.1.11) (JS uploaded 3/18/18 3:11 PM)
* Serve scripts in wordpress plugin from cloudfront; wp plugin is separate from the actual js.
* Use minified, production-build scripts
* allow "gulp serve" option for devs to make it self-contained (client)

## 1.1.10 (server only)
* add logging for emails sent and 
* bcc and cc support for emails (in confirmationEmailInfo)
* use send_email instead of send_raw_email for emails
* allow email "toField" to be deep (with dot notation to access value)
* fix bug: email confirmation not sent when using a coupon code on new response

## 1.1.9 (server only)
* add formSummary option (publicly accessible) from responses.

## 1.1.8 (server-side lambda only)
* Disallow editing of schema 

## 1.1.7 (client plugin only)
* Show payment info total as part of response table (to be exported as CSV)
* Row aggregations / summaries.
* Let dataOptions specify displayed and aggregated rows.

## 1.1.6 (server-side lambda only)
* Bugfix: allow coupon codes with arbitrary names
* Allow maximum of coupon codes to be negative (no maximum)
* Bugfix: mark new response with 100% off coupon code as PAID
* allow contentHeader and contentFooter option in emails

## 1.1.5 (client plugin only -- no updates on server lambda)
Feb 23 2018
* Allow multiple validations on a single path to be specified by an array.
```
  "ui:cff:validate:if":["age < 13 and race:'Half Marathon'==1 ", "a=b"]
  "ui:cff:validate:message": ["Participants under 13 cannot register for Half Marathon.", "message2"]
```
* add part of the framework for focusUpdateInfo (not functional yet)
* Form css changes (color, padding, bolded labels)
* Allow customization of "pay with paypal" button in paymentMethodInfo:
```
{
  "payButtonText": "Pay Now"
}
```


## 1.1.4
Feb 10 2018
Small fixes:
* Change default modes on JSON editor
* Graceful error handling when entering a non-numeric additional donation.

## 1.1.3
Feb 10 2018
### UI
* Show discount amount in paypal cart to account for coupon codes, etc.
* Paypal cart now shows all the items on update, as opposed to just "amount owed on update".
* Proper currency format using Intl.NumberFormat in javascript
* Format currency with two decimal places in email
* Email table formatting fixed
* Show empty string instead of "undefined" when exporting responses as CSV

### Functionality
* Implement coupon codes -- count towards maximum when user submits, not necessarily pays.
* Add coupon code widget (cff:couponCode) and money widget (cff:money)
* Expression parser (both js and python) allows to check for equality of strings (i.e., if race is a string, "race:5K==1" returns if race is 5K) -- before this would only work with arrays.
* properly compare ipn amount if updating to an amount *less* than before
* Allow simple conditional validation as follows (in schemaModifier):
```
{
  "age": ...,
  "race": ...
  "ui:cff:validate:if":"age < 13 and race:'Half Marathon'==1 "
  "ui:cff:validate:message": "Participants under 13 cannot register for Half Marathon."
}
```
* Fix "required" override in schemaModifier

## 1.1.2
Feb 6 2018
* Formula calculation on client side -- live refresh when user updates the form.

## 1.1.1
Feb 4 2018
* Add round off widget.
* Allow for use of $total in payment formulas.
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
* (Lambda) no longer store confirmationEmailInfo in response; several checks for ipns (wrong emails, duplicate txn ids); payment_history array now stores all payments
* Began authentication integration with cognito (not enabled yet).
* Better schema / schema modifier generation by allowing fields to be EXCLUDED by default.
* Use cff prefixes for custom ui schema attributes
* Render form info pane twice in editing view
* Add phone number widget.

Lambda functions:
* Show only items with a net cost in confirmation page.

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
