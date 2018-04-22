
This feature lets you do this. For example, for a single room or double room option (which would change the array length), this is useful.

SM:
{
  "number": {
    "type": "number",
    "enum": [1,2]
  }
  "participants": {
    "minItems": "ui:cff:updateFromField:number"
  }
}