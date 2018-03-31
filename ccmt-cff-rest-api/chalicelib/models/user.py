from .common import get_table_name
from .schemas import ObjectReferenceSchema
from dynamorm import DynaModel, GlobalIndex, ProjectInclude
from marshmallow import Schema, fields

class User(DynaModel):
    """
    A user.
    """
    class Table:
        name = get_table_name("users")
        hash_key = "id"

    class Schema:
        # todo: use fields.UUID once data has been cleaned up (from cma and om run)
        id = fields.String(required=True)
        first_name = fields.String()
        last_name = fields.String()
        email = fields.Email()
        date_last_modified = fields.DateTime()
        date_created = fields.DateTime()
        centers = fields.List(fields.Integer())
        auth_type = fields.String()