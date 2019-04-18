Make a GET request to {API_ENDPOINT}/forms/{formId}/responses/?query=test

Only those with `Responses_View` or `Responses_Checkin` permissions can access this functionality.

Can configure the following in dataOptions:
```
{
    "search": {
        "searchFields": [...], // ["_id"] by default
        "resultFields": [...], // ["_id"] by default
        "resultLimit": ... // 10 by default
    }
}


```