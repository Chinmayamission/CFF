from .common import get_table_name
from dynamorm import DynaModel, GlobalIndex, ProjectInclude
from marshmallow import Schema, fields
from .schemas import PaymentInfoSchema, ObjectReferenceSchema, DataOptionsSchema
from .schemas.permissions import PermissionsSchema
from dynamorm.relationships import OneToOne, ManyToOne, OneToMany


class FormSchemaModifier(DynaModel):
    class Table:
        name = get_table_name("schemaModifiers")
        hash_key = "id"
        range_key = "version"

    class Schema:
        id = fields.String(required=True)
        version = fields.Integer(required=True)
        value = fields.Raw()
        paymentInfo = fields.Nested(PaymentInfoSchema)
        paymentMethods = fields.Dict()  # todo
        confirmationEmailInfo = fields.Dict()  # todo
        dataOptions = fields.Nested(DataOptionsSchema)
        date_last_modified = fields.DateTime()
        date_created = fields.DateTime()

class FormSchema(DynaModel):
    class Table:
        name = get_table_name("schemas")
        hash_key = "id"
        range_key = "version"

    class Schema:
        id = fields.String(required=True)
        version = fields.Integer(required=True)
        value = fields.Raw()
        date_last_modified = fields.DateTime()
        date_created = fields.DateTime()


class CouponCodeItem(Schema):
    amount = fields.Decimal()
    max = fields.Integer()  # -1 or greater than 0.


class CouponCodeUsedItem(Schema):
    responses = fields.List(fields.Dict(
        keys=fields.String(), values=fields.Integer())) # todo change UUID to string.


class Form(DynaModel):
    """
    A Form.
    """
    class Table:
        name = get_table_name("forms")
        hash_key = "id"
        range_key = "version"

    class ByCenter(GlobalIndex):
        name = 'center-index'
        hash_key = 'center'
        read = 1
        write = 1
        projection = ProjectInclude(
            'name', 'id', 'version', 'schema', 'schemaModifier')  # doesn't work.

    class Schema:
        # todo: use fields.UUID once data has been cleaned up (from cma and om run)
        id = fields.String(required=True)
        version = fields.Integer(required=True)
        center = fields.Integer()
        date_last_modified = fields.DateTime()
        date_created = fields.DateTime()
        schema = fields.Nested(ObjectReferenceSchema)
        schemaModifier = fields.Nested(ObjectReferenceSchema)
        cff_permissions = fields.Nested(PermissionsSchema, attribute="cff:permissions")

class FormAdmin(Form):
    class Schema:
        couponCodes = fields.Dict(keys=fields.String(), values=CouponCodeItem)
        couponCodes_used = fields.Dict(
            keys=fields.String(), values=CouponCodeUsedItem)
