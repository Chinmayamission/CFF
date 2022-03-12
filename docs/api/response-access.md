Sometimes, it is useful to provision API keys so that an external website can access form responses or aggregate statistics without needing to log in.

For an example of this in action, see the [2020 Sanjeevan Hanuman website](https://sanjeevan-hanuman-followers.chinmayamission.com/).

## Provide anonymous access

To provide anonymous access to all responses in a form, use the `formOptions.responseListApiKey` parameter. To generate the api key value to set, use this code in Python:

```bash
import uuid
import hashlib
api_key = str(uuid.uuid4())
encoded_api_key = hashlib.sha512(api_key.encode()).hexdigest()
print("api key is ", api_key, "encoded api key is ", encoded_api_key)
```

Then provide the api key to the user using the form, and set `formOptions.responseListApiKey` to the encoded api key.

```bash
{
  "responseListApiKey": "[encoded api key]"
}
```

Then, someone can access the form responses by calling https://drcfbob84gx1k.cloudfront.net/v2/forms/[formId]/responses?apiKey=[apiKey]. Sample JS code (note that a dummy value must be included in the `Authorization` header):

```
fetch("https://drcfbob84gx1k.cloudfront.net/v2/forms/.../responses?dataOptionView=summary&apiKey=...", {headers: {"Authorization": "a"}});
```

### Use api key per dataOptionView

If you want to give anonymous access only to a particular dataOptionView (so that, for example, you only publicly expose certain statistics), set the `apiKey` value in the dataOptionView.

```bash
"dataOptions": {
  "views": [
    {
      "id": "testview",
      "name": "test view",
      "apiKey": "[encoded api key]"
    }
  ]
}
```

Then, someone can access the form responses by calling https://drcfbob84gx1k.cloudfront.net/v2/forms/[formId]/responses?dataOptionView=[dataOptionViewId]&apiKey=[apiKey].