# Initial setup
Before a CCAvenue account can be used with CFF, add a manual entry directly in the database with the required fields (this can be done from the Azure Cosmos DB portal).
```
{
    "merchant_id":"...",
    "SECRET_working_key":"...",
    "access_code":"...",
    "_cls":"chalicelib.models.CCAvenueConfig"
}
```

# Setup for a single form
Add the following in paymentMethods:
```
"paymentMethods": {
    "ccavenue": {
        "merchant_id": "...",
    }
}
```

## Sub account
To use a sub account, add the `sub_account_id` parameter as follows:

```
"paymentMethods": {
    "ccavenue": {
        "merchant_id": "...",
        "sub_account_id": "..."
    }
}
```