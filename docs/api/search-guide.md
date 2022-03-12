This guide explains how to set up API access so that certain fields can be searched in a form.

## Configure API key

First, run the below code in Python to generate an API key:

```python
import uuid
import hashlib
api_key = str(uuid.uuid4())
encoded_api_key = hashlib.sha512(api_key.encode()).hexdigest()
print("api key is ", api_key, "encoded api key is ", encoded_api_key)
```

Note down the API key, and set `formOptions.responseListApiKey` to the value of the encoded api key.

```json
{
  "responseListApiKey": "[encoded api key]"
}
```

## Configure search

Configure `formOptions.dataOptions.search` with the following:

```json
{
    "search": {
        "searchFields": [...], // ["_id"] by default
        "resultFields": [...], // ["_id"] by default
        "resultLimit": ... // 10 by default
    }
}
```

You should set `searchFields` to which fields will be searched, and `resultFields` to which fields can be returned. `resultLimit` returns the fields that are returned.

Note that you must prepend fields in the form data with `value.` -- for example, to reference the `email` field, you must enter in `value.email`. Here is an example configuration that allows searching of a single user by email, then returns that user's name and email:

```json
{
    "search": {
        "searchFields": ["value.email"],
        "resultFields": ["value.name", "value.email"],
        "resultLimit": 1,
        "exactMatch": true
    }
}
```

Note that setting `exactMatch` to true can significantly speed up query performance by requiring that the specified field(s) match exactly the given query. By default, the fields are searched with a regex that ensure that the specified fields only *begin with* the given query.

## Performing the search

Then, to perform the search, add the search term in the `query` parameter in the query string, and include the API key in the `apiKey` query parameter. Every call to the search API must also set the `Authorization` header to any value, such as `a`. Here is an example of a proper request to search the API:

```
fetch("https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/v2/forms/5b47419b666d2c0001263a8b/responses?apiKey=ee5737bc-e55a-48e2-a907-0a9cc2a00ade&query=a", {headers: {"Authorization": "a"}}).then(e => console.log(e));
```

Note that anyone with this API key will not only be able to search the fields specified, but will also be able to view all responses if they omit the `query` parameter in the URL.