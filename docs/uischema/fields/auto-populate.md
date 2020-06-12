Auto populate allows fetching data from an asynchronous endpoint.

USAGE: 

in the schema:

```json
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
```

in the ui schema:

```json
{
    "ui:field": "cff:autoPopulate",
    "ui:options": {
      "cff:autoPopulateEndpoint": "https://www.chinmayamission.com/wp-json/gcmw/v1/centres",
      "cff:autoPopulateTitleAccessor": "name"
    }
}
```

This will make a query to https://www.chinmayamission.com/wp-json/gcmw/v1/centres and load the options from there, sort them alphabetically, and then create a widget so that people can select from that list.

You can also only show results that match a schema by specifying `cff:autoPopulateMatchSchema`:

```json
{
    "ui:field": "cff:autoPopulate",
    "ui:options": {
      "cff:autoPopulateEndpoint": "https://www.chinmayamission.com/wp-json/gcmw/v1/centres",
      "cff:autoPopulateTitleAccessor": "name",
      "cff:autoPopulateMatchSchema": {
        "type": "object",
        "properties": {
          "Type": {"const": "centre"}
        }
      }
    }
}
```