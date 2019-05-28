Auto populate allows fetching data from an asynchronous endpoint.

USAGE: 
in the ui schema:

```
{
    "ui:field": "cff:autoPopulate",
    "ui:options": {
      "cff:autoPopulateEndpoint": "https://chinmayamission.com/wp-json/get_centres"
      "cff:autoPopulateFieldPath": "centre",
      "cff:autoPopulateQueryStrPath": "q"
    }
}
```

This will make a query to https://chinmayamission.com/wp-json/get_centres?q=CMSJ and then take that value, then set the field value to it.