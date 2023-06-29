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


## Calculate distances

You may want to calculate distances between the entered address and the location. You must use a schema with the `distance` key -- here, the distance to the closest location will be in meters:

```json
{
    "address": {
        "type": "object",
        "properties": {
            "line1": {"type": "string"},
            "line2": {"type": "string"},
            "city": {"type": "string"},
            "state": {"type": "string"},
            "zipcode": {"type": "string"},
            "country": {"type": "string"},
            "distance": {"type": "number"}
        }
    }
}
```

Then, in the uiSchema, pass a list of locations along with their associated latitude, longitudes:

```json
{
    "address": {
        "ui:field": "cff:addressAutocomplete",
        "ui:options": {
        "cff:locationDistance": {
            "locations": [
            {
                "lat": "38.8977",
                "lng": "77.0365"
            },
            {
                "lat": "38.8977",
                "lng": "-77.0365"
            }
        },
        "distance": {
            "ui:widget": "hidden"
        }
    }
}

```

Finally, when you enter your address, it will calculate the distance and then save it in the `distance` field. You can use this as a conditional schema in order to do specific validation. For example, to restrict registration to 50 miles (80467 meters), use:

```json
{
    "if": {
      "properties": {
        "address": {
          "properties": {
            "distance": {
              "minimum": 80467
            }
          }
        }
      }
    },
    "then": {
        "properties": {
            "name": {"type": "string"}
        }
    },
    "else": {
      "properties": {
        "notEligible": {
          "type": "boolean",
          "const": true,
          "default": true
        },
        "notEligibleMessage": {
          "title": "Not Eligible",
          "description": "You are not eligible for E-Balavihar because you are within 50 miles of the closest Balavihar center. Please submit this form to continue.",
          "type": "null"
        }
      }
    }
}
```

## Get top N closest locations

You can have the N closest locations saved to the data by adding in a `closestLocations` key.

```json
{
    "address": {
        "type": "object",
        "properties": {
            "line1": {"type": "string"},
            "line2": {"type": "string"},
            "city": {"type": "string"},
            "state": {"type": "string"},
            "zipcode": {"type": "string"},
            "country": {"type": "string"},
            "closestLocations": {"type": "array", "items": {"type": "object", "additionalProperties": true}}
        },
        "distance": {
            "ui:widget": "hidden"
        },
        "closestLocations": {
            "ui:widget": "hidden"
        }
    }
}
```

Then, in the uiSchema, pass a list of locations along with their associated latitude, longitudes, and other data you might want to be passed into the form data. Also set the `saveNClosestLocations` prop:

```json
{
    "address": {
        "ui:field": "cff:addressAutocomplete",
        "ui:options": {
        "cff:locationDistance": {
            "saveNClosestLocations": 5,
            "locations": [
            {
                "lat": "38.8977",
                "lng": "77.0365",
                "street1": "123 ABC Street"
            },
            {
                "lat": "38.8977",
                "lng": "-77.0365",
                "street1": "124 ABC Street"
            }
        }
    }
}

```

Finally, when you enter your address, it will calculate the distance (in meters) and then save it in the `distance` field, and save the 5 closest locations to `closestLocations` (or whatever number is set in `saveNClosestLocations`). Each element in `closestLocations` will also have a `distance` key with the specific distance of that location.
