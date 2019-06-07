Auto populate allows fetching data from an asynchronous endpoint.

USAGE: 

in the schema:

{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "address1": {"type": "string"},
    "address2": {"type": "string"},
    "state": {"type": "string"},
    "zip": {"type": "string"},
    "city": {"type": "string"},
    "country": {"type": "string"}
  }
}

in the ui schema:

```
{
    "ui:field": "cff:autoPopulate",
    "ui:options": {
      "cff:autoPopulateEndpoint": "https://www.chinmayamission.com/wp-json/gcmw/v1/centres",
      "cff:autoPopulateTitleAccessor": "name"
    }
}
```

And data:



This will transform it to:

```
{
  "oneOf": {
    "title": "
  }
}

```

This will make a query to https://chinmayamission.com/wp-json/get_centres?q=CMSJ and then take that value, then set the field value to it.