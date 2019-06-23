Arrays

# Customizing buttons
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