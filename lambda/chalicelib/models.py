from pymongo import TEXT
from pymodm import connect, fields, MongoModel, EmbeddedMongoModel
from bson.objectid import ObjectId
import datetime
import os
import pymodm
from bson.json_util import dumps, RELAXED_JSON_OPTIONS, DatetimeRepresentation
import json

currency_field = fields.CharField(required=True)
money_field = fields.CharField(required=True)


class BaseMongoModel(MongoModel):
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = ObjectId()
            self.date_created = datetime.datetime.now()
        self.date_modified = datetime.datetime.now()
        super(BaseMongoModel, self).save(*args, **kwargs)

    class Meta:
        collection_name = os.getenv("DB_NAME", "cff_dev")


class Center(EmbeddedMongoModel):
    name = fields.CharField()


class User(BaseMongoModel):
    name = fields.CharField(blank=True)
    email = fields.EmailField(blank=True)
    id = fields.CharField(primary_key=True)


class FormOptions(EmbeddedMongoModel):
    paymentInfo = fields.DictField(blank=True)
    confirmationEmailInfo = fields.DictField(blank=True)
    confirmationEmailTemplates = fields.ListField(
        fields.DictField(blank=True), blank=True
    )
    dataOptions = fields.DictField(blank=True)
    paymentMethods = fields.DictField(blank=True)
    defaultFormData = fields.DictField(blank=True)
    showConfirmationPage = fields.BooleanField()
    successMessage = fields.CharField()
    messages = fields.DictField(blank=True)
    loginRequired = fields.BooleanField()
    responseModificationEnabled = fields.BooleanField()
    responseSubmissionEnabled = fields.BooleanField()
    responseCanViewByLink = fields.BooleanField()
    responseCanEditByLink = fields.BooleanField()
    predicate = fields.DictField(blank=True)
    successor = fields.DictField(blank=True)
    omitExtraData = fields.BooleanField()
    theme = fields.DictField(blank=True)
    # Contains *configuration* for admin_info.
    adminInfo = fields.DictField(blank=True)
    adminFields = fields.ListField(blank=True)
    postprocess = fields.DictField(blank=True)
    counter = fields.DictField(blank=True)
    dashboardOptions = fields.DictField(blank=True)
    responseListApiKey = fields.CharField(blank=True)
    # Link that the user can use to make modifications to the form. Should be set especially
    # if the form is hosted on a custom domain (such as an iframe).
    modifyLink = fields.CharField(blank=True)
    # If set, submitOptions is set to this value by default.
    defaultSubmitOptions = fields.DictField(blank=True)


class Form(BaseMongoModel):
    name = fields.CharField(required=True)
    id = fields.ObjectIdField(primary_key=True)
    schema = fields.DictField(required=True)
    uiSchema = fields.DictField(required=True)
    formOptions = fields.EmbeddedDocumentField(FormOptions, required=True)
    couponCodes_used = fields.DictField(required=False)
    cff_permissions = fields.DictField(required=True)
    center = fields.CharField()  # not used
    date_modified = fields.DateTimeField(required=True)
    date_created = fields.DateTimeField(required=True)
    formType = fields.CharField()  # not used
    version = fields.IntegerField()  # not used
    tags = fields.ListField(fields.CharField(), blank=True)


class Org(BaseMongoModel):
    name = fields.CharField()
    id = fields.ObjectIdField(primary_key=True)
    cff_permissions = fields.DictField(required=True)


class FormResponseCounter(MongoModel):
    """Used to generate numeric, human-readable ids for
    each form response.
  """

    counter = fields.IntegerField()
    form = fields.ReferenceField(Form, on_delete=fields.ReferenceField.CASCADE)

    class Meta:
        collection_name = os.getenv("DB_NAME", "cff_dev")


class PaymentStatusDetailItem(EmbeddedMongoModel):
    amount = money_field
    currency = currency_field
    date = fields.DateTimeField(required=True)
    date_created = fields.DateTimeField()
    date_modified = fields.DateTimeField()
    method = fields.CharField(required=True)
    id = fields.CharField(blank=True)
    notes = fields.CharField(blank=True)


class PaymentTrailItem(EmbeddedMongoModel):
    value = fields.DictField()
    date = fields.DateTimeField(required=True)
    date_created = fields.DateTimeField()
    date_modified = fields.DateTimeField()
    method = fields.CharField(required=True)
    status = fields.CharField()
    id = fields.CharField()
    notes = fields.CharField(blank=True)


class UpdateTrailItem(EmbeddedMongoModel):
    old = fields.DictField()
    new = fields.DictField()
    date = fields.DateTimeField(required=True)
    update_type = fields.CharField()
    path = fields.CharField()
    user = fields.ReferenceField(User, blank=True)
    old_value = fields.CharField(blank=True)
    new_value = fields.CharField(blank=True)
    response_base_path = fields.CharField(blank=True)


class EmailTrailItem(EmbeddedMongoModel):
    value = fields.DictField()
    date = fields.DateTimeField(required=True)


# class PaymentInfoItem(EmbeddedMongoModel):
#   name = fields.CharField(required=True, min_length=1)
#   description = fields.CharField(required=True, min_length=1)
#   amount = fields.Decimal128Field(required=True)
#   quantity = fields.IntegerField(required=True)
#   recurrenceDuration = fields.CharField(required=False)

# class PaymentInfo(EmbeddedMongoModel):
#   currency = currency_field
#   total = money_field
#   redirectUrl = fields.URLField()
#   items = fields.EmbeddedDocumentListField(PaymentInfoItem, blank=True, default=list)


class Response(BaseMongoModel):
    id = fields.ObjectIdField(primary_key=True)
    form = fields.ReferenceField(Form, on_delete=fields.ReferenceField.CASCADE)
    user = fields.ReferenceField(
        User, on_delete=fields.ReferenceField.CASCADE, blank=True
    )
    # paymentInfo = fields.EmbeddedDocumentField(PaymentInfo)
    paymentInfo = fields.DictField()
    payment_status_detail = fields.EmbeddedDocumentListField(
        PaymentStatusDetailItem, blank=True, default=list
    )
    paid = fields.BooleanField(default=False)
    amount_paid = fields.CharField(default="0")
    # amount_paid_cents and amount_owed_cents duplicate the
    # values in amount_paid and paymentInfo.total, respectively;
    # they just make it easier to do aggregation of fields and
    # could supersede the other two fields in storing this info in the future.
    amount_paid_cents = fields.IntegerField(blank=True)
    amount_owed_cents = fields.IntegerField(blank=True)

    payment_trail = fields.EmbeddedDocumentListField(
        PaymentTrailItem, blank=True, default=list
    )
    update_trail = fields.EmbeddedDocumentListField(
        UpdateTrailItem, blank=True, default=list
    )
    email_trail = fields.EmbeddedDocumentListField(
        EmailTrailItem, blank=True, default=list
    )
    value = fields.DictField()
    date_created = fields.DateTimeField(required=True)
    date_modified = fields.DateTimeField(required=True)
    pending_update = fields.DictField(blank=True)
    admin_info = fields.DictField()
    modify_link = fields.CharField(blank=True)
    predicate = fields.DictField()
    counter = fields.IntegerField(blank=True)


class CCAvenueConfig(BaseMongoModel):
    id = fields.ObjectIdField(primary_key=True)
    merchant_id = fields.CharField(required=True)
    SECRET_working_key = fields.CharField(required=True)
    access_code = fields.CharField(required=True)


def serialize_model(model):
    """Serializes model so it is OK to send back as a JSON response.
  """
    if type(model) in (list, pymodm.queryset.QuerySet):
        return [serialize_model(m) for m in model]
    options = RELAXED_JSON_OPTIONS
    options.datetime_representation = DatetimeRepresentation.ISO8601
    model = json.loads(dumps(model.to_son().to_dict(), json_options=options))
    model.pop("_cls")
    for k, v in model.items():
        if type(v) is dict:
            v.pop("_cls", "")
    # for k in list(model):
    #   v = model[k]
    #   if type(v) is ObjectId:
    #     model[k] = str(v)
    #   elif hasattr(v, "to_son"):
    #     model[k] = serialize_model[v]
    #   elif k == "_cls":
    #     del model[k]
    #   elif type(v) is datetime.datetime:
    #     model[k] = str(v)
    return model
    # for k in list(dict_):
    #   v = dict_[k]
    #   if k == "_cls":
    #     del dict_[k]
    #   elif type(v) not in (str, int, float, dict, type(None)):
    #     dict_[k] = str(v)
    # return dict_
