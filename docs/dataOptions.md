# Data Options
Stored in schemaModifier.

Data options v2.0 (with custom views):
Columns: ID, PAID, DATE_CREATED, DATE_LAST_MODIFIED, AMOUNT_OWED, AMOUNT_PAID
id must match regex [a-zA-Z_]*?
```json
views: [
  {
    "displayName": "View 1",
    "id": "one",
    "columns": ["ID", "PAID", "DATE_LAST_MODIFIED", "name", "interests"]
  },
  {
    "displayName": "View 1",
    "id": "one",
    "columns": ["first", "last", "ID"]
  }
]
```



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