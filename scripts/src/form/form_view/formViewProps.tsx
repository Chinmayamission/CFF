import React from "react";
import { Object } from "core-js";

// TODO: import this from RJSF.
const widgetMap = {
  boolean: {
    checkbox: "CheckboxWidget",
    radio: "RadioWidget",
    select: "SelectWidget",
    hidden: "HiddenWidget"
  },
  string: {
    text: "TextWidget",
    password: "PasswordWidget",
    email: "EmailWidget",
    hostname: "TextWidget",
    ipv4: "TextWidget",
    ipv6: "TextWidget",
    uri: "URLWidget",
    "data-url": "FileWidget",
    radio: "RadioWidget",
    select: "SelectWidget",
    textarea: "TextareaWidget",
    hidden: "HiddenWidget",
    date: "DateWidget",
    datetime: "DateTimeWidget",
    "date-time": "DateTimeWidget",
    "alt-date": "AltDateWidget",
    "alt-datetime": "AltDateTimeWidget",
    color: "ColorWidget",
    file: "FileWidget"
  },
  number: {
    text: "TextWidget",
    select: "SelectWidget",
    updown: "UpDownWidget",
    range: "RangeWidget",
    radio: "RadioWidget",
    hidden: "HiddenWidget"
  },
  integer: {
    text: "TextWidget",
    select: "SelectWidget",
    updown: "UpDownWidget",
    range: "RangeWidget",
    radio: "RadioWidget",
    hidden: "HiddenWidget"
  },
  array: {
    select: "SelectWidget",
    checkboxes: "CheckboxesWidget",
    files: "FileWidget",
    hidden: "HiddenWidget"
  }
};

// TODO: better keep this in sync with CustomForm.tsx.
let widgetNames = [
  "cff:smallTextbox",
  "cff:money",
  "cff:couponCode",
  "cff:confirm",
  "cff:jsonEditor",
  "cff:conditionalHiddenRadio",
  "cff:infoboxRadio",
  "cff:infoboxSelect"
];
for (let subMap of Object.values(widgetMap)) {
  for (let widgetName of Object.values(subMap)) {
    widgetNames.push(widgetName);
  }
}

const ViewWidget = props => (
  <div>
    {console.log(props, props.value)}
    {props.value || <small className="text-muted">None</small>}
  </div>
);

const ViewField = props => <div>{props.value || "None"}</div>;

let widgets = {};
for (let widgetName of widgetNames) {
  widgets[widgetName] = ViewWidget;
}

const formViewProps = {
  widgets,
  fields: {
    // TODO: fix CustomTitleField and CustomDescriptionField
  }
};

export default formViewProps;
