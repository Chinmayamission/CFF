You can configure modifications to form data that is performed after a response is submitted by using the `formOptions.postprocess` option. This logic gets applied to the response two times:

- when a new response is submitted; and
- when a response is modified.

## Example

```json
"postprocess": {
  "patches": [
    {
      "type": "patch",
      "value": [
          { "op": "add", "path": "/installment1", "value": "2020-01-30" }
      ]
    }
  ]
}
```

Every item in the `patches` array is applied in order. Each item in the `patches` array must contain an object with `type` equal to `patch`, and the `value` key equal to a valid array in [JSON Patch](http://jsonpatch.com/) format.

## Using patches with payment expressions

If an item in the `patches` array has the `expr` property equal to `true`, this is a way to slightly extend JSON Patch with support for payment expressions in the `value` property.

For every item in the `value` array, the `value` property will first be evaluated as a payment expression with the current response, then will be set to this evaluated value. Finally, the entire array will be applied as a JSON Patch.

Here's an example of doing a dynamic patch with an expression, which sets `installment1` to today's date:

```json
"postprocess": {
  "patches": [
    {
      "type": "patch",
      "expr": true,
      "value": [
        { "op": "add", "path": "/installment1", "value": "cff_today()" }
      ]
    }
  ]
}
```