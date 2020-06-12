The uiSchema is used to configure the look and feel of the form. The format of the uiSchema is `{[key]: [value object]}`, where `[key]` is the property name and `[value object]` is the object describing the styling of that particular property.

All uiSchema options supported by react-jsonschema-form are also supported here. We also have additional widgets and options; all these options are prefixed by `cff:`.

## List of custom uiSchema configuration options

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

## List of custom uiSchema widgets and fields

Coming soon