The redirect payment method redirects to a new form.

## Sample configuration

Here is a sample configuration:

```json
{
  "redirect": {
    "payButtonText": "Continue",
    "skipConfirmationPage": true,
    "formId": "644aedc97bff0cc53b9212ae",
    "initialFormDataKeys": "[\"address\"]",
    "specifiedShowFields": "{\"CFF_uiSchema.address['ui:readonly']\": true}"
  }
}
```

`payButtonText`: Text that shows up on the button

`skipConfirmationPage`: If set to true, the confirmation page isn't shown, and the page immediately redirects to the given form (if the payment method is enabled / shown). Default is false.

`formId`: Form ID to redirect to

`initialFormDataKeys`: If set, the form will be populated with an object that consists of the specified form data keys from the current form data. Specify a JSON-stringified list of paths (which will be passed to lodash get) -- so each path should be in dot notation (e.g., `address` or `address.line1`). Note that this form data will show up in the next form URL though, through the `initialFormData` query string. See section below for more details.

`specifiedShowFields`: If set, the form's schema will be augmented with the given JSON-stringified representation of an object. The keys should be a list of paths to set (lodash paths) and the values should be the values to set. The schema to be augmented also shows up in the next form URL. See section below for more details.

### Conditionally redirect

You can conditionally redirect by combining `skipConfirmationPage` with `cff_show_when`. For example, to automatically redirect to a new form on submit when `age > 10`, do the following:

```json
{
  "redirect": {
    "skipConfirmationPage": true,
    "cff_show_when": "age > 10"
  }
}
```

### `initialFormData`

Forms can have an `initialFormData` query string, which populates a form with the given initial form data. The value should be a JSON-stringified version of an object that should be used to populate the initial form data of the form. For example, to set initial form data to `{"returning": true}`, use:

https://forms.chinmayamission.com/v2/forms/6431d67b8d817d41006d17c2/?initialFormData=%7B%22returning%22%3Atrue%7D

You can generate the value for the query string by running `encodeURIComponent(JSON.stringify({"returning": true}))`

### `specifiedShowFields`

Forms can have a `specifiedShowFields` query string, which augments the form's schema with the paths specified in the given form data. The keys should be lodash paths to set, and the values should be the values to set.

For example, you can augment the schema's `required` and `properties.customSponsorshipAmount.$ref` fields by running the following: `encodeURIComponent(JSON.stringify({"required": [ "company_name", "contact_name", "email", "email_secondary", "address", "customSponsorshipAmount" ], "properties.customSponsorshipAmount.$ref": "#/definitions/customSponsorshipAmount" }))`

And then go to the URL: 

https://forms.chinmayamission.com/v2/forms/6431d67b8d817d41006d17c2/?specifiedShowFields=%7B%22required%22%3A%5B%22company_name%22%2C%22contact_name%22%2C%22email%22%2C%22email_secondary%22%2C%22address%22%2C%22customSponsorshipAmount%22%5D%2C%22properties.customSponsorshipAmount.%24ref%22%3A%22%23%2Fdefinitions%2FcustomSponsorshipAmount%22%7D

You can also change the uiSchema by prepending the path with `CFF_uiSchema`. For example, you can do as follows:

`encodeURIComponent(JSON.stringify({"CFF_uiSchema.couponCode['ui:widget']": "text"}))`