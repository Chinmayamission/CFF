You can enter in the number of items in an array. First, add this in the uiSchema to the array element:

```
  "participants": {
    "ui:cff:showArrayNumItems": true
  },
```

Then it will show up like this:

![image](https://user-images.githubusercontent.com/1689183/59124225-005da880-8914-11e9-81c1-24df16a1dbee.png)

It will have a dropdown from `minItems` and `maxItems`, both defined in the schema.