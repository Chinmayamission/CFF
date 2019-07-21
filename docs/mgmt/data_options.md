Data options help manage which columns/views are shown in the response table.

## Getting started
If you want to change beyond the default view, add the following to `formOptions`:

```
  "dataOptions": {
    "views": [
      {
        "id": "all",
        "displayName": "All",
        "columns": [
          "ID",
          "DATE_LAST_MODIFIED",
          "DATE_CREATED",
          "COUNTER",
          "email"
        ]
      }
    ]
  }
```

Note that each item in `views` must have an `id` and (optionally) a `displayName`. The `columns` value describes which columns will show up in this view's table view in the "Responses" tab.