from .common import get_table_name
from dynamorm import DynaModel
from marshmallow import Schema, fields

class Center(DynaModel):
    """
    A center.
    """
    class Table:
        name = get_table_name("centres")
        hash_key = "id"

    class Schema:
        id = fields.Integer(required=True)
        name = fields.String()