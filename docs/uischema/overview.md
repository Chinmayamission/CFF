The uiSchema is used to configure the look and feel of the form. The format of the uiSchema is `{[key]: [value object]}`, where `[key]` is the property name and `[value object]` is the object describing the styling of that particular property.

All uiSchema options supported by react-jsonschema-form are also supported here. We also have additional widgets and options; all these options are prefixed by `cff:`.

## Custom configuration options

| Name      | Description | Example Usage |
| ----------- | ----------- | ------------------- |
|  ui:cff:autocomplete  | Should be set on the root of the uiSchema. If set to true, enables the `autocomplete` attribute on the HTML form. | `{"ui:cff:autocomplete": true }` |
|  ui:cff:validate  | Can be set to enable custom validation based on expressions. See [Custom Validation](./validate.md) for more details. |  |
|  ui:cff:submitButtonText  | Should be set on the root of the uiSchema. If set, overrides the default submit button text. | `{"ui:cff:submitButtonText": "Register" }` |
|  ui:cff:disableModifExistingItems  | Can be set on array fields. If set to true, disables modification of existing items in the array. | `{"ui:cff:disableModifExistingItems": true }` |
|  ui:cff:showArrayNumItems  | Set on array fields. If set to true, shows a "number of items" dropdown before the array. | `{"ui:cff:showArrayNumItems": true }` |
|  ui:cff:arrayNumItemsTitle  | Set on array fields and only has an effect when `ui:cff:showArrayNumItems` is true. If set, customizes the title shown for the "number of items" dropdown. | `{"ui:cff:arrayNumItemsTitle": "Number of participants" }` |
|  ui:cff:arrayItemTitles  | Set on array fields. Should be set to an array. If set, each item in the array field will have its title set to the corresponding item in `ui:cff:arrayItemTitles`. | `{"ui:cff:arrayItemTitles": ["Parent", "Spouse"] }` |
|  ui:cff:removeButtonText  | Set on array fields. If set, overrides the default "remove" button text. | `{"ui:cff:removeButtonText": "Remove participant" }` |
|  ui:cff:addButtonText  | Set on array fields. If set, overrides the default "add" button text. | `{"ui:cff:addButtonText": "Add participant" }` |
|  ui:cff:showAddButton  | Set on array fields. If set to false, the add button is hidden. | `{"ui:cff:showAddButton": false }` |
|  ui:cff:background  | Set on the root schema. Can be set to a color, e.g. `#ff0000`, or anything that the CSS [`background`](https://developer.mozilla.org/en-US/docs/Web/CSS/background) property accepts. If set, overrides the default background of the form. | `{"ui:cff:background": "white" }` |

## Custom widgets

| Name      | Description | Example Usage |
| ----------- | ----------- | ------------------- |
|  cff:smallTextbox  | Small textbox | `{"ui:widget": "cff:smallTextbox"}` |
|  cff:money  | Money widget | `{"ui:widget": "cff:money"}` |
|  cff:couponCode  | Coupon code | `{"ui:widget": "cff:couponCode"}` |
|  cff:confirm  | Copies a textbox to give a "confirm" widget. Useful for, example, creating "email" and "confirm email" fields.  | `{"ui:widget": "cff:confirm"}` |
|  cff:jsonEditor  | JSON editor | `{"ui:widget": "cff:jsonEditor"}` |
|  cff:conditionalHiddenRadio  | Radio widget, but hides if `schema.readOnly` or `schema.const` are true | `{"ui:widget": "cff:conditionalHiddenRadio"}` |
|  cff:infoboxRadio  | Shows a red "i" sign next to the label right before a radio widget. Hovering on the "i" shows an infobox, whose contents are equal to `schema["cff:radioDescription"]`. | `{"ui:widget": "cff:infoboxRadio"}` |
|  cff:infoboxSelect  | Shows a red "i" sign next to the label right before a select widget. Hovering on the "i" shows an infobox, whose contents are equal to `schema["cff:radioDescription"]`. | `{"ui:widget": "cff:infoboxSelect"}` |
|  cff:removed  | Renders null (this is different from the `hidden` widget, which just renders an `<input type="hidden" />` tag) | `{"ui:widget": "cff:removed"}` |

## Custom fields

Unlike widgets, which only work on base types (non-objects or arrays), fields can work on object types as well.

| Name      | Description | Example Usage |
| ----------- | ----------- | ------------------- |
|  cff:sameAs  | Shows a checkbox before the field that says "same as" another field. When this checkbox is checked, the data from the other field will be copied into this field. | `{"ui:field": "cff:sameAs", "ui:cff:sameAsFieldName": "first name", "ui:cff:sameAsFieldPath": "name.first"}` |
|  cff:autoPopulate  | Makes a query to a HTTP endpoint to fetch enum options, which are then used to populate the results of the current field. | `{"ui:field": "cff:autoPopulate", "ui:cff:autoPopulateEndpoint": "https://www.chinmayamission.com/wp-json/gcmw/v1/centres", "ui:cff:autoPopulateTitleAccessor": "name"}` |
|  cff:dynamicEnum  | Fetches a set of enum options based on form data. The path of the specified form data comes from `ui:cff:dynamicEnumDataAccessor`. | `{"ui:field": "cff:dynamicEnum", "ui:cff:dynamicEnumDataAccessor": "names" }` |
|  cff:addressAutocomplete  | Shows a textbox where the user can type a location, with suggestions from the Google Maps API. | `{"ui:field": "cff:addressAutocomplete"}` |
|  cff:removed  | Renders null | `{"ui:field": "cff:removed"}` |