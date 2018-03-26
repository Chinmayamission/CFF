# Data Options
Stored in schemaModifier.

Sample value:
```json
{
  "mainTable": {
    "aggregateCols": [
      "PAID"
    ],
    "columnOrder": [
      "contact_name.last",
      "contact_name.first"
    ]
  },
  "unwindTables": {
    "participants": {
      "columnOrder": [
        "NUMERIC_ID",
        "contact_name.last",
        "contact_name.first",
        "race",
        "zipcode",
        "shirt_size",
        "name.last"
      ],
      "aggregateCols": [
        "race",
        "name.last"
      ]
    }
  }
}
```


## Custom aggregation of cols:
```
  "shirt_size",
  {"title": "Cotton shirt sizes", "colName": "shirt_size", "filter": {"key": "race", "value": "Mela"}},
  {"title": "Tek shirt sizes", "colName": "shirt_size", "filter": {"key": "race", "value": ["5K", "10K", "Half Marathon"]}},
```