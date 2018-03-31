from marshmallow import Schema, fields

PERMISSIONS_LIST = fields.List(fields.String())
class PermissionsSchema(Schema):
    manualEntry = PERMISSIONS_LIST
    ViewResponses = PERMISSIONS_LIST
    ViewResponseSummary = PERMISSIONS_LIST