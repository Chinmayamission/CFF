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

# quick form test code
```
function setVal(input, theValue, elemType=window.HTMLInputElement) { var nativeInputValueSetter = Object.getOwnPropertyDescriptor(elemType.prototype, "value").set;
nativeInputValueSetter.call(input, theValue);

var ev2 = new Event('input', { bubbles: true});
input.dispatchEvent(ev2);
}
for (let i of document.getElementsByTagName("input")) { if (i.type == "email") setVal(i, "aramaswamis+12@gmail.com"); else if (i.type=="tel") setVal(i, "7708182022"); else if (i.type == "checkbox") setVal(i, true); else if (i.label=="age") setVal(i, 15); else setVal(i, "test"); }
for (let i of document.getElementsByTagName("select")) {setVal(i, i.children[1].value, window.HTMLSelectElement);}
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