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
- allow admins to view unsuccessful/incomplete IPN responses.


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


# modifications to schema
schemaModifier: allows classNames, ui:... props.
schema: allows classNames, ui:... props.

## New prop: `ui:defaultValue`
ui:defaultValue -- default value when form first loads.

ui:defaultValue --> ui:cff-defaultValue



ui:emptyValue -- default value after form is submitted & this field is empty; included in rjf library.
ui:copyValueOption -- gives "Same as X" which lets you 
  ui:copyValueOption : "$contact_name"

classNames -- custom bs classes added for fiveColumn, fourColumn, flex, etc.