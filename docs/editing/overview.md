# Form Editing

All forms can be configured using JSON configuration options. You can edit three things in a form:

- **schema** - data structure of the form. This is rendered using [JSON Schema](https://json-schema.org/).

- **uiSchema** - look and feel of the form. This is where you can configure CSS class names or custom widgets to be rendered on the form.

- **formOptions** - configures other options such as payment integration, responses view, form submission closing, confirmation emails, and more.

## react-jsonschema-form

CFF uses the open source library [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) in order to render forms on the frontend. The `schema` and `uiSchema` configured for each form is directly passed to the `<Form />` component from react-jsonschema-form.

CFF also has custom widgets and fields registered with react-jsonschema-form; these features can be enabled by passing configuration through the uiSchema. See the [uiSchema introduction](uischema/introduction.md) for an exhaustive list of all custom widgets and fields that can be enabled.

To see more demos about what can be created by combining different schemas and uiSchemas, see the examples at the [react-jsonschema-form playground](https://rjsf-team.github.io/react-jsonschema-form/). 