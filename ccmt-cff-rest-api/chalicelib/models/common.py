import os
from marshmallow import Schema, fields

def get_table_name(name):
    if name in ["responses", "schemaModifiers", "schemas", "forms", "centers"]:
        return "{}.{}".format(os.getenv("TABLE_PREFIX"), name)
    else:
        return name

class ObjectReferenceSchema(Schema):
    id = fields.String(required=True) # todo: use fields.UUID once data has been cleaned up (from cma and om run)
    version = fields.Integer(required=True)