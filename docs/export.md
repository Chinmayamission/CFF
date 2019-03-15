## Aggregation

```
{
  "id": "aggregate_paid",
  "aggregate": [
    {
      "|group": {
        "_id": "$paid",
        "count": {
          "|sum": 1
        }
      }
    }
  ]
}
```