Dashboard options are accessible through the user dashboard view. This is accessible through the `/v2/dashboard/formId` link -- for example, https://forms.beta.chinmayamission.com/v2/dashboard/5c99508834513d000161a237/

## Adding tabs to the dashboard

You can add a tab to the dashboard by editing the `views` array. Note that each item in `views` must have a unique `id` and a `displayName`.

```
  "dashboardOptions": {
    "views": [
      {
        "id": "basic",
        "displayName": "Edit Basic Info",
        "type": "form",
        "pickFields": [
          "contactName"
        ]
      }
    ]
  }
```

### template views

The simplest type of view is a template -- this is a HTML template
that displays the response info in the specified template.

For example:
```
{
  "id": "basic",
  "displayName": "Edit Basic Info",
  "type": "template",
  "template": {
    "html": {
      "Hello, {{value.name.first}} {{value.name.last}}. Here is your info:<br> ....."
    }
  }
}
```

## form views

The form view shows a subset of a form.

update their names, add family members, update email, change password, see all forms submitted?