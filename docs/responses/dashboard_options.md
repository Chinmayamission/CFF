!!! warning
    This feature is still under active development and not complete.

Dashboard options are accessible through the user dashboard view. This is accessible through the `/v2/dashboard/formId` link -- for example, https://forms.beta.chinmayamission.com/v2/dashboard/5c99508834513d000161a237/

## Header

To add a dashboard header, you can insert custom HTML in `dashboardOptions.views.header`. The header will be shown above the tabs.

```
  "dashboardOptions": {
    "header": "<h1>Welcome to the MSC dashboard!</h1><br />"
  }
```

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

### Template views

The simplest type of view is a template -- this is a HTML template
that displays the response info in the specified template.

For example:
```
{
  "id": "profile",
  "displayName": "View profile",
  "type": "template",
  "template": {
    "html": {
      "Hello, {{value.name.first}} {{value.name.last}}. Here is your info:<br> ....."
    }
  }
}
```

## Form views

The form view shows a subset of a form. You can choose which properties to show using the `pickFields` attribute. Optionally, you can override the uiSchema for those particular fields with the `uiSchema` attribute (the `uiSchema` will merge with the existing uiSchema, but replace the values of overlapping keys).

```json
{
  "id": "subset",
  "displayName": "Edit Basic Info",
  "type": "template",
  "pickFields": [
    "contactName"
  ],
  "uiSchema": {
    "contactName": {
      "classNames": "col-12"
    }
  }
}
```

Right now, we only support top-level fields with `pickFields`.

### Disallow modification of existing items in arrays

You can disallow modification of existing items in an array (but still allow adding additional items) by adding the following `uiSchema` attribute to modify the uiSchema:

```json
{
  "id": "subset",
  "displayName": "Edit Basic Info",
  "type": "template",
  "pickFields": [
    "participants"
  ],
  "uiSchema": {
    "participants": {
      "ui:cff:disableModifExistingItems": true
    }
  }
}
```