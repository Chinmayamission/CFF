import os
from marshmallow import Schema, fields

def get_table_name(name):
    if name in ["responses", "schemaModifiers", "schemas", "forms", "centers"]:
        return "{}.{}".format(os.getenv("TABLE_PREFIX"), name)
    else:
        return name