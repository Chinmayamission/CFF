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

To add up matching values in `paymentInfo`. set the `queryType` to `paymentInfoItemPaidSum` and specify the names of payment info items in `queryValue`. For example, this could be useful for showing the amount a user has paid for multiple items (such as item 1 + item 2 + discount).

```
{
  "label": "Amount paid for registration",
  "queryType": "paymentInfoItemPaidSum",
  "queryValue": {
    "names": [
      "Main",
      "Discount"
    ]
  }
}
```

This would match items in `paymentInfo` with `name` equal to "Main" or "Discount" and sum these values. For example, it would be equal to 49.5 for the following value of paymentInfo:

```
[
  {"name": "Main", "amount": 50, "quantity": 1, "total": 50},
  {"name": "Sub", "amount": 10, "quantity": 1, "total": 10},
  {"name": "Discount", "amount": -0.5, "quantity": 1, "total": -0.5}
]
```

Note that if using `paymentInfoItemPaidSum` will also cross-check with amount paid. If a payment is partially paid, then it will reduce the final value accordingly. For example, if the initial sum of paymentInfoItems is equal to 49.5, but if the user has only paid 1/3 of the total amount owed (such as through an installment), the final value will be equal to 49.5 / 3 = 16.5.

If you want to filter only payments in a particular date range, specify both `startDate` and `endDate` in queryValue. Both should be in UTC. This will decrease the amounts shown proportionally as well.

```
{
  "label": "Amount paid for registration",
  "queryType": "paymentInfoItemPaidSum",
  "queryValue": {
    "names": [
      "Main",
      "Discount"
    ],
    "startDate": "2019-01-01T08:00:01.000Z",
    "endDate": "2020-01-01T08:00:00.000Z"
  }
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

## Provide anonymous access

To provide anonymous access to all responses in a form, use the `formOptions.responseListApiKey` parameter. To generate the api key value to set, use this code in Python:

```bash
import uuid
import hashlib
api_key = str(uuid.uuid4())
encoded_api_key = hashlib.sha512(api_key.encode()).hexdigest()
print("api key is ", api_key, "encoded api key is ", encoded_api_key)
```

Then provide the api key to the user using the form, and set `formOptions.responseListApiKey` to the encoded api key.

```bash
{
  "responseListApiKey": "[encoded api key]"
}
```

Then, someone can access the form responses by calling https://drcfbob84gx1k.cloudfront.net/v2/forms/[formId]/responses?apiKey=[apiKey]. Sample JS code (note that a dummy value must be included in the `Authorization` header):

```
fetch("https://drcfbob84gx1k.cloudfront.net/v2/forms/.../responses?dataOptionView=summary&apiKey=...", {headers: {"Authorization": "a"}});
```

### Use api key per dataOptionView

If you want to give anonymous access only to a particular dataOptionView (so that, for example, you only publicly expose certains stats), set the `apiKey` value in the dataOptionView.

```bash
"dataOptions": {
  "views": [
    {
      "id": "testview",
      "name": "test view",
      "apiKey": "[encoded api key]"
    }
  ]
}
```

Then, someone can access the form responses by calling https://drcfbob84gx1k.cloudfront.net/v2/forms/[formId]/responses?dataOptionView=[dataOptionViewId]&apiKey=[apiKey].