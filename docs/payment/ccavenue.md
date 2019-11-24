Add the following in paymentMethods:
```
"paymentMethods": {
    "ccavenue": {
        "merchant_id": "...",
    }
}
```

To use a sub account, add the `sub_account_id` parameter as follows:

```
"paymentMethods": {
    "ccavenue": {
        "merchant_id": "...",
        "sub_account_id": "..."
    }
}
```

Add a manual entry in the database (from Azure Cosmos DB portal):
```
{
    "merchant_id":"...",
    "SECRET_working_key":"...",
    "access_code":"...",
    "_cls":"chalicelib.models.CCAvenueConfig"
}
```

And the CCAvenue integration should then work.