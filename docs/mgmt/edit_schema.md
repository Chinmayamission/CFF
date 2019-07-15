An editSchema is used to make it easier to edit things in bulk in the admin. It will end up rendering a dropdown in the actual admin view, so that admins can quickly edit data.

It goes in the `.columns` attribute of an element in `dataOptions.views`:
```
{
    "label": "On hold",
    "value": "on_hold",
    "editSchema": {
        "type": "boolean",
        "enum": ["Yes", "No"],
        "enumNames": ["Yes", "No"]
    }
}
```

It *must* include both `enum` and `enumNames`.