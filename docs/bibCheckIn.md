Todo:

Allow complete customization of tables in dataOptions:
```
  "tables": [
    {
      "title": "Check In",
      "unwindBy": "registrants",
      "columnOrder": ["name.first", "name.last", "email"],
      "omrunCheckin": true
    }
  ]
```

For now:
```
"checkinTable": {
  "columnOrder": [],
  "omrunCheckin": true
}
```