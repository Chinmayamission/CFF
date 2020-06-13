The `formOptions.omitExtraData` property can be set to true. This sets the `omitExtraData` prop on the form, which causes extra form data values that are not in any form field will be removed upon submit. By default, this prop is set to false.

This is important when there are complex forms with dependencies, and you do not want extra data from unselected dependencies to show up. See the [react-jsonschema-form reference](https://react-jsonschema-form.readthedocs.io/en/latest/api-reference/form-props/#omitextradata) for more details.

```json
{
  "formOptions": {
    "omitExtraData": true
  }
}
```