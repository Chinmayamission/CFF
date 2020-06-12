Custom validation can be performed using the `ui:cff:validate` option in the uiSchema.

```
  "ui:cff:validate": [
    {
      "if": "phone == 1231231233",
      "then": "Phone Number cannot be '1231231233'."
    }
  ]
```