from .common import get_table_name, ObjectReferenceSchema
from dynamorm import DynaModel
from marshmallow import Schema, fields

class CouponCodeItem(Schema):
    amount = fields.Decimal()
    max = fields.Integer() # -1 or greater than 0.

class CouponCodeUsedItem(Schema):
    responses = fields.List(fields.UUID())

class Form(DynaModel):
    """
    A Form.
    """
    class Table:
        name = get_table_name("forms")
        hash_key = "id"
        range_key = "version"
    class Schema:
        id = fields.String(required=True) # todo: use fields.UUID once data has been cleaned up (from cma and om run)
        version = fields.Integer(required=True)
        date_last_modified = fields.DateTime()
        date_created = fields.DateTime()
        schema = fields.Nested(ObjectReferenceSchema)
        schemaModifier = fields.Nested(ObjectReferenceSchema)
        couponCodes = fields.Dict(keys=fields.String(), values=CouponCodeItem)
        couponCodes_used = fields.Dict(keys=fields.String(), values=CouponCodeUsedItem)