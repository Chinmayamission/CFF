Data options help manage which columns/views are shown in the response table.

## Changing the columns
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

### Columns object

To change the title of a column, replace the string in the `columns` array with an object with keys `label` and `value`. For example:

```
  "columns": [
    "ID",
    "DATE_LAST_MODIFIED",
    "DATE_CREATED",
    {"label": "Family ID", "value": "COUNTER"},
    "email"
  ]
```

The columns object also supports a basic level of aggregation. Right now, we support the `calculateLength` parameter, which when set to true, will show the length of the value in the `value` parameter (whether it is a string or an array). For example, to show the number of participants in a response (if participants is an array of objects), use the following header object:

```
{
  "label": "Number of participants",
  "value": "participants",
  "calculateLength": true
}
```

To show the value of a custom expression, set the `queryType` to `expr` and specify the expression value in `queryValue`. For example, this could be useful for showing the amount a user has paid for a particular item by doing a price calculation.

```
{
  "label": "Amount paid for registration",
  "queryType": "expr",
  "queryValue": "10 * (age < 18) + 15 * (age >= 18)"
}
```

To run a custom mongodb aggregate query, do the following. The "n" key of the result will end up showing in the column:

```
{
  "label": "Age Group",
  "queryType": "aggregate",
  "queryValue": [
    {
      "$project": {
        "n": {
          "$switch": {
            "branches": [
              {"case": {"$lt": ["$age", 18]}, "then": "Child" },
              {"case": {"$lt": ["$age", 29]}, "then": "CHYK" },
              {"case": {"$lt": ["$age", 41]}, "then": "Setukari" }
            ],
            "default": "Adult"
          }
        }
      }
  ]
}
```

## Adding a summary view
You can add a summary view which runs aggregate queries in MongoDB and then shows the results of those queries in the responses table view. To do so, add an object in dataOptions.views such as the following:
```json
"views": [{
  "id": "summary",
  "displayName": "Summary",
  "type": "stats",
  "stats": [
    {
      "type": "single",
      "title": "Total number of Yajman families",
      "queryType": "aggregate",
      "queryValue": [
        {"$match": {"value.registrationType": "sponsorship"}},
        { "$group": { "_id": null, "n": { "$sum": 1 } } }
      ]
    },
    {
      "type": "single",
      "title": "Total money collected",
      "queryType": "aggregate",
      "queryValue": [{ "$group": { "_id": null, "n": { "$sum": "$amount_paid" } } } ]
    }
  ]
}]
```

### queryType aggregate

When `queryType` is `aggregate`, the queryValue will be calculated by evaluating the first value of `n` in the result set.

### type = "single"

When type is single, this means that a single value will be shown. The "title" attribute will be the title, and the value will be next to it. Make sure that the aggregate result has a key called "n".

### type = "group"

When type is group, this means that a table of values will be shown. The "title" attribute is the title of the table. For example, you can use the following value as an item in `stats`:

```json
{
  "type": "group",
  "title": "Aggregate by city",
  "queryType": "aggregate",
  "queryValue": [
      { "$group": { "_id": "$value.city", "n": { "$sum": 1 } } }
  ]
}
```