You can use the CFF API to access resources from another client, such as an app. Make sure you include the `Authorization` header to all requests.

Create an account at [https://forms.chinmayamission.com](https://forms.chinmayamission.com).

Click on "Create form" to create a form (note: you must get approval from one of the admins before being able to do so). Go to the "form edit" page and add the following:

Form Options

```json
{
  "paymentInfo": {
    "items": [],
    "currency": "USD"
  },
  "showConfirmationPage": false,
  "confirmationEmailInfo": {},
  "dataOptions": {},
  "paymentMethods": {},
  "defaultFormData": {},
  "loginRequired": false
}
```

Schema:

```
{
  "title": "Form",
  "properties": {
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "date": {
      "type": "string",
      "format": "date"
    }
  },
  "type": "object"
}
```

uiSchema:

```
{
  "title": "Form"
}
```

In our case, we have created a form with form ID 5d368b0692a26900015e6391. Click on "View" to view the form (we are at [https://forms.chinmayamission.com/v2/forms/5d368b0692a26900015e6391/](https://forms.chinmayamission.com/v2/forms/5d368b0692a26900015e6391/) now):

![image](https://user-images.githubusercontent.com/1689183/61682560-01ca1100-acc7-11e9-8cd9-ffbd58e58f10.png)

Enter in a name, email, and date, and then submit the form.

Now go back to the form admin and go to the responses view. Copy the ID; this is now the response ID you need:

![image](https://user-images.githubusercontent.com/1689183/61682613-23c39380-acc7-11e9-831b-20c431b1b85e.png)


Now, let's access the ! Make sure you have the form ID and response ID at hand. In our case, the form ID is `5d368b0692a26900015e6391` and the response ID is `5d368bf392a26900015e6392`.

## Getting response data

Request:

```js
fetch("https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/v2/responses/5d368bf392a26900015e6392", {
    method: 'get',
    mode: 'cors',
    headers: {"Authorization": "anonymous"}
})
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

## Editing response data - API

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
})
```

## Editing response data - UI
This is useful for admins to use. They can just go to the URL [https://forms.chinmayamission.com/v2/forms/5d368b0692a26900015e6391?responseId=5d368bf392a26900015e6392](https://forms.chinmayamission.com/v2/forms/5d368b0692a26900015e6391?responseId=5d368bf392a26900015e6392), then edit the data and submit:

![image](https://user-images.githubusercontent.com/1689183/61682702-8b79de80-acc7-11e9-900c-38d269e7ae29.png)

## Creating a new response - API

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
})
```