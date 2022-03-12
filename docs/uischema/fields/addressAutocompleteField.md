Address autocomplete field - shows a textbox which allows a user to type in an address, with suggestions from the Google Maps API. Once the user selects the location, it will auto-fill the textboxes for line 1, line 2, etc.

## Usage

Schema:

```
{
    "address": {
        "type": "object",
        "properties": {
            "line1": {"type": "string"},
            "line2": {"type": "string"},
            "city": {"type": "string"},
            "state": {"type": "string"},
            "zipcode": {"type": "string"},
            "country": {"type": "string"}
        }
    }
}
```

uiSchema:

```
{
    "address": {
        "ui:field": "cff:addressAutocomplete"
    }
}
```

## Specify location type

You can also specify `cff:locationType` in `ui:options` in order to change the types of suggestions that show up. By default, the suggestions are addresses. To change, set the value equal to `cities` and you will get only city results:

```
{
    "address": {
        "ui:field": "cff:addressAutocomplete",
        "ui:options": {
            "cff:locationType": "cities"
        }
    }
}

```

![image](https://user-images.githubusercontent.com/1689183/63220158-cfc99480-c136-11e9-9cc8-4de40bc6f63a.png)