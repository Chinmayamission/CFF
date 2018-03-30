from .common import get_table_name
from .schemas import ObjectReferenceSchema
from dynamorm import DynaModel, GlobalIndex, ProjectInclude
from marshmallow import Schema, fields

class Response(DynaModel):
    """
    A form response.
    """
    class Table:
        name = get_table_name("responses")
        hash_key = "formId"
        range_key = "responseId"

    class Schema:
        # todo: use fields.UUID once data has been cleaned up (from cma and om run)
        formId = fields.String(required=True)
        responseId = fields.String(required=True)
        PAID = fields.Boolean()
        date_last_modified = fields.DateTime()
        date_created = fields.DateTime()
        form = fields.Nested(ObjectReferenceSchema)
        modifyLink = fields.String()

        schema = fields.Nested(ObjectReferenceSchema)
        schemaModifier = fields.Nested(ObjectReferenceSchema)
        couponCodes = fields.Dict(keys=fields.String(), values=CouponCodeItem)
        couponCodes_used = fields.Dict(
            keys=fields.String(), values=CouponCodeUsedItem)