Dashboard options are accessible through the user dashboard view. This is accessible through the `/v2/dashboard/formId` link -- for example, https://forms.beta.chinmayamission.com/v2/dashboard/5c99508834513d000161a237/

## Changing the columns

Note that each item in `views` must have a unique `id` and a `displayName`.

```
  "dataOptions": {
    "views": [
      {
        "id": "basic",
        "displayName": "Edit Basic Info",
        "type": "form",
        "pickSchema": [
          ""
        ]
      }
    ]
  }
```

update their names, add family members, update email, change password, see all forms submitted?