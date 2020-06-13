## Customizing buttons
You can change the add button text and remove button text as follows:

```json
"participants": {
  "type": "array",
  "items": [...],
  "ui:cff:addButtonText": "Add the person",
  "ui:cff:removeButtonText": "Remove! Custom text!",
}
```

You can remove the add buttons this way:

```json
"participants": {
    "ui:cff:showAddButton": false
}
```

## Showing a "number of items" field

You can create a "number of items" field so that the user enters in the number of items in an array (as opposed to clicking on buttons to add/remove). First, add this in the uiSchema to the array element:

```json
  "participants": {
    "ui:cff:showArrayNumItems": true
  },
```

Then it will show up like this:

![image](https://user-images.githubusercontent.com/1689183/59124225-005da880-8914-11e9-81c1-24df16a1dbee.png)

It will have a dropdown from `minItems` and `maxItems`, both defined in the schema.

You can also define the title (instead of "Number of participants" with the following option):

```json
  "participants": {
    "ui:cff:showArrayNumItems": true,
    "ui:cff:arrayNumItemsTitle": "Enter the number of elements in the array"
  },
```

Specifying `ui:cff:arrayNumItemsTitle` in the schema will override that which is specified in the uiSchema's `ui:cff:arrayNumItemsTitle`.