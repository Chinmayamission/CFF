# Response Reporting

Response reporting, display options, and admin aggregation options can all be controlled by the `formOptions.dataOptions` object.

## dataOptions structure

Here is the structure of the `dataOptions` object (all root fields are optional):

```json
{
  "dataOptions": {
    "views": { ... },
    "groups": { ... },
    "export": { ... },
    "search": { ... }
  }
}
```

The **views** field is used to control which tabs show up in the admin responses view.

The **groups** field is used to define groups (such as classes) that individual responses can be assigned to.

The **export** field is used to configure export options to Google Sheets.

The **search** field is used to configure options regarding search endpoint capabilities for responses.