You can use the CFF API to access resources from another client, such as an app.

Make sure you include the `Authorization` header to all requests. The `Authorization` header needs a valid JWT for authenticated routes; for unauthenticated routes, the header can have any arbitrary value (but it needs to have some value).

The list of examples on this page are not exhaustive; for a full list of available API routes, see [lambda/chalicelib/main.py](https://github.com/epicfaace/CFF/blob/master/lambda/chalicelib/main.py).

## Creating a new response

Request:

```js
let body = {
    data: {
        name: "New Name",
        email: "New Email",
        date: "1995-01-03"
    }
}
fetch("https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/v2/forms/5d368b0692a26900015e6391", {
    method: 'post',
    body: JSON.stringify(body),
    mode: 'cors',
    headers: {"Authorization": "anonymous", "Content-Type": "application/json"}
}).then(e => console.log(e));
```


## Getting response data

Request:

```js
fetch("https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/v2/responses/5d368bf392a26900015e6392", {
    method: 'get',
    mode: 'cors',
    headers: {"Authorization": "anonymous"}
}).then(e => console.log(e));
```

Response -- note that the data you need is in the `value` key:

```json
{
    "success": true,
    "res": {
        "_id": {
            "$oid": "5d368bf392a26900015e6392"
        },
        "form": {
            "$oid": "5d368b0692a26900015e6391"
        },
        "paymentInfo": {
            "items": [],
            "currency": "USD",
            "total": 0
        },
        "paid": true,
        "amount_paid": "0",
        "value": {
            "name": "Ashwin",
            "email": "a@b.com",
            "date": "2019-07-10"
        },
        "date_created": {
            "$date": "2019-07-23T04:24:19.777Z"
        },
        "date_modified": {
            "$date": "2019-07-23T04:24:19.777Z"
        },
        "modify_link": "https://forms.chinmayamission.com/v2/forms/5d368b0692a26900015e6391/?responseId=5d368bf392a26900015e6392",
        "counter": null
    }
}
```

## Editing response data

Request:

```js
let body = {
    data: {
        name: "New Name",
        email: "New Email",
        date: "1995-01-03"
    },
    responseId: "5d368bf392a26900015e6392"
}
fetch("https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/v2/forms/5d368b0692a26900015e6391", {
    method: 'post',
    body: JSON.stringify(body),
    mode: 'cors',
    headers: {"Authorization": "anonymous", "Content-Type": "application/json"}
}).then(e => console.log(e));
```