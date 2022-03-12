# JSON Schema

The schema specifies the data structure of form responses. It must be a valid [https://json-schema.org/](JSON Schema) object.

!!! note
    This section only provides a brief overview of the structure of JSON Schema, and the other pages in this section provide examples of commonly used schemas used in forms. To learn more about JSON Schema in depth, check out the following resources:

    - [Learn JSON Schema](https://json-schema.org/learn/getting-started-step-by-step.html)
    - [react-jsonschema-form playground](https://rjsf-team.github.io/react-jsonschema-form/)
    - [react-jsonschema-form documentation](https://react-jsonschema-form.readthedocs.io/en/latest/)

## Simple types

To create a form with a single field, use the following schema:

```json
{
  "type": "string"
}
```

The other base types other than `string` include `number`, `boolean`, `object`, `array`, and `null`.

## Object types

You can create object types by specifying a type `object` and specifying the list of properties in the `properties` key. Here is a sample object:

```json
{
  "type: "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "age": {
      "type": "number"
    }
  }
}
```

## Array types

You can create array types by specifying a type `array` and specifying the list of properties in the `items` key. Here is a sample array:

```json
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

You can also specify arrays of objects, as follows:

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "age": {
        "type": "number"
      }
    }
  }
}
```