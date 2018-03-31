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
        paymentInfo = fields.Raw() # todo: fix all Raw's
        confirmationEmailInfo = fields.Raw()
        value = fields.Raw()
        IPN_HISTORY = fields.Raw()
        IPN_STATUS = fields.String() # INVALID, etc. todo
        PAYMENT_HISTORY = fields.Raw()
        PAYPAL_TXN_IDS = fields.List(fields.String())
        PENDING_UPDATE = fields.Raw() # has paymentInfo, value, modifyLink.
        # paymentInfo = fields.Nested(PaymentInfoSchema)