# New, chalice-based permissions
On a form:

owner
Responses_View
Responses_Edit
Responses_CheckIn
Responses_Export
Responses_ViewSummary
Forms_PermissionsView
Forms_PermissionsEdit

todo:
Forms_List
Schemas_List
Forms_Edit
SchemaModifiers_Edit == Forms_Edit?


# Old, Credential-based permissions
[form id="formId" apiEndpoint="endpoint" authKey="authKey" specifiedShowFields="couponCode, manualPayment"]


This renders:
```
<div data-cff-form-id="formId"
  data-ccmt-cff-api-endpoint="endpoint"
  data-ccmt-cff-auth-key="authKey"
  data-ccmt-cff-specified-show-fields="couponCode, manualPayment">
```

## ui:cff:display:if:specified
Displays the item only if the path is included within specifiedShowFields. Useful for something such as couponCode or manualPayment, which you don't want to display by default; only want to display it on special admin forms.
Schema:
```
"manualEntry": {
    "title": "Method of Payment",
    "type": "string"
}
```
SchemaModifier:
```{
    "manualEntry": {
        "enum": ["Cash", "Check", "Other"],
        "ui:cff:display:if:specified": true
    }
}```

# Auth key
Auth key can be used to perform specific actions in the WP shortcode.
```[form formId="formId" apiEndpoint="endpoint" authKey="123456" specifiedShowFields="couponCode, manualPayment"]```
For example, let's say you want the form with the auth key to be behind password protection, and only allow forms with this auth key to do manual entry. Then in the permissions for the form, you would add:
Form:
```{
    "cff:permissions": {
        "manualEntry": [
            "cff:authKey:123456"
        ]
    }
}```
Ta-da! Now manual entry works.
To let anyone do manual entry, do:
```{
    "cff:permissions": {
        "manualEntry": [
            "cff:authKey:"
        ]
    }
}```

## Other use cases / examples
- Show additionalDonation and manualPayment:
[ccmt-cff-render-form id="5c243e62-5407-402b-a89b-5190c46d0d05" specifiedShowFields="additionalDonation, manualPayment"]
now:specifiedShowFields
[ccmt-cff-render-form id="5c243e62-5407-402b-a89b-5190c46d0d05" specified-show-fields='{"participants": "minItems": 1}']
