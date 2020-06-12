This will render a checkbox saying something like, "same as first participant's name".

USAGE: 
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