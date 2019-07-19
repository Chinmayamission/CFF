Post-schema submission logic can be performed using the `postprocess` option in formOptions. This gets applied to the response when a new response is submitted, or when a response is modified. The below shows an example.

```
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

Example of doing a dynamic patch with an expression:
```
"postprocess": {
    "patches": [
      {
        "type": "patch",
        "expr": True,
        "value": [
            { "op": "add", "path": "/installment1", "value": "cff_today()" }
        ]
      }
    ]
}
```