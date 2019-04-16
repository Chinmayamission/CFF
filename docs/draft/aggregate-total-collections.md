Used in Om Run 2019.
Have to use paymentInfo.total because CosmosDB doesn't support the string-to-int operators introduced in MongoDB 4.0.

```
{
        "id": "aggregate_collections",
        "aggregate": [
          {
            "|match": {
              "paid": true
            }
          },
          {
            "|group": {
              "_id": null,
              "donation": {
                "|sum": "$value.additionalDonation"
              },
              "totalPaid": {
                "|sum": "$paymentInfo.total"
              }
            }
          }
        ]
      }
```