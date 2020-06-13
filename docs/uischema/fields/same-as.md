The `cff:sameAs` field shows a checkbox before the field that says "same as" another field. When this checkbox is checked, the data from the other field will be copied into this field.

The field path of the other field is specified by `ui:cff:sameAsFieldPath`, and the text that shows up after "same as" is specified by `ui:cff:sameAsFieldName`.

This will render a checkbox saying something like, "same as first participant's name".

## Usage

in the ui schema:

```json
{
    "ui:field": "cff:sameAs",
    "ui:options": {
      "cff:sameAsFieldPath": "contact_name",
      "cff:sameAsFieldName": "contact name"
    }
}
```

If you want an array to show sameAs only for the first one, add the following to the uiSchema in the array:

```json
{
    "classNames": "ccmt-cff-array-sameAs-showFirst"
}
```