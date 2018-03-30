from marshmallow import Schema, fields

class ObjectReferenceSchema(Schema):
    id = fields.String(required=True) # todo: use fields.UUID once data has been cleaned up (from cma and om run)
    version = fields.Integer(required=True)

class ManualEntrySchema(Schema):
    enabled = fields.Boolean()
    inputPath = fields.String() # todo: field path, validate this.

class PaymentInfoItemSchema(Schema):
    name = fields.String()
    description = fields.String()
    amount = fields.String() # todo: this is a formula.
    quantity = fields.String()

class PaymentInfoSchema(Schema):
    currency = fields.String() # todo: use fields.UUID once data has been cleaned up (from cma and om run)
    items = fields.Nested(PaymentInfoItemSchema)
    version = fields.Integer(required=True)
    manualEntry = fields.Nested(ManualEntrySchema)