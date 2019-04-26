Add the "checkin" property to the form schema.

Add the following to dataOptions:

```
{
    "search": {
      "searchFields": [
        "_id",
        "value.contact_name.last",
        "value.contact_name.first",
        "value.email",
        "value.participants.name.first",
        "value.participants.name.last",
        "value.participants.bib_number"
      ],
      "resultFields": [
        "_id",
        "value.contact_name.last",
        "value.contact_name.first",
        "value.email",
        "value.participants"
      ],
      "autocompleteFields": [
        "value.contact_name.last",
        "value.contact_name.first"
      ],
      "resultLimit": 10
    }
}
```