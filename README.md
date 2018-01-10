# Usage
[ccmt-cff-render-form id="59dbf12b734d1d18c05ebd21"]


# Run
```npm install
npm install -g webpack gulp
gulp
```
# Setup
```cd "/mnt/c/Users/arama/Documents/My Web Sites/WordPress/wp-content/plugins/CFF"

find . -type f -exec rename 's/gcmw/CCMT/' '{}' \;
```

Todo for Training:
- send modify link in confirmation email; make confirmation email look better with a table.
- remove all the payment details at the end; instead, redirect to a new confirmation page.
- implement modify registration logic.
- in IPN verification, also make sure the amounts match. allow admins to view unsuccessful/incomplete IPN responses.
- set up proper from-email-name.
- cache buster!

- implement scroll to top to show errorlist
- download updated typings for react-jsonschema-form
- change to bootstrap 3, and not just the grid.
- reacttable export to csv, etc.; fix error in unwinding.

OM RUN Refunds:
- if you owe money, charge difference immediately
- if you are owed money, either donate or request a manual refund.
- 10 days before reg, ... etc. rules

SURVEY:
- json schema, after that.

PRIVACY

EDITABLE LINK
HIDE PAYMENT PROCESSING.

CCMT pays extra.
PayPal IPN

color coding
incomplete order link

Future:
- allow unwinding of nested array rows.
- react-jsonschema-form-extras

Done:
- fix form checkbox changing error (strs vs bools) formpage.tsx.
