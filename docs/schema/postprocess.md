Post-schema submission logic can be performed using the `postprocess` option in formOptions. This gets applied to the response when a new response is submitted. The below shows an example.

```
"postprocess": {
    "items": [
        {
          "type": "expr",
          "value": {"key": "deadline1", "value": "getDeadline1()"}
        }
    ]
}
```