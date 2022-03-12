The dynamic enum field allows for the enum options of a field to be populated dynamically from the data in another form.

## Usage 

Imagine you have an array of centres that you would like people to enter in in the form, in the `centres` key. However, you have another spot in the form, the `location` field, which you would like to show a select box with dynamically populated options based on the centres you chose. In the schema:

```json
{
  "centres": {
      "type": "array",
      "items": {
          "type": "object",
          "properties": {
              "name": {"type": "string"},
              "location": {"type": "string"}
          }
      }
  },
  "location": {"type": "string"}
}
```

in the ui schema:

```json
{
    "location": {
        "ui:field": "cff:dynamicEnum",
        "ui:options": {
          "cff:dynamicEnumDataAccessor": "centres.name"
        }
    }
}
```

We see that `cff:dynamicEnumDataAccessor` is used to access the data from which the options are populated. Currently, this accessor allows the same notation as in lodash's `get` function; it also supports, to a limited level, getting properties of objects in arrays one level deep.