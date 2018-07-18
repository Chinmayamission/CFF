from pymongo import TEXT
from pymodm import connect, fields, MongoModel, EmbeddedMongoModel
from bson.objectid import ObjectId
import datetime
import os
import pymodm
from bson.json_util import dumps, RELAXED_JSON_OPTIONS, DatetimeRepresentation
import json 

currency_field = fields.CharField(required=True, choices=("USD", "INR"))
money_field = fields.CharField(required=True)

class BaseMongoModel(MongoModel):
  def save(self, *args, **kwargs):
    if not self.id:
      self.id = ObjectId()
      self.date_created = datetime.datetime.now()
    self.date_modified = datetime.datetime.now()
    # print(self.to_son().to_dict())
    super(BaseMongoModel, self).save(*args, **kwargs)
  class Meta:
    collection_name = os.getenv("DB_NAME", "cff_dev")

class Center(EmbeddedMongoModel):
  name = fields.CharField()

class User(EmbeddedMongoModel):
  name = fields.CharField()
  email = fields.EmailField()
  id = fields.CharField()

class FormOptions(EmbeddedMongoModel):
  paymentInfo = fields.DictField(blank=True)
  confirmationEmailInfo = fields.DictField(blank=True)
  dataOptions = fields.DictField(blank=True)
  paymentMethods = fields.DictField(blank=True)
  defaultFormData = fields.DictField(blank=True)
  showConfirmationPage = fields.BooleanField()
  successMessage = fields.CharField()
  loginRequired = fields.BooleanField()

class Form(BaseMongoModel):
  name = fields.CharField(required=True)
  id = fields.ObjectIdField(primary_key=True)
  schema = fields.DictField(required=True)
  uiSchema = fields.DictField(required=True)
  formOptions = fields.EmbeddedDocumentField(FormOptions, required=True)
  cff_permissions = fields.DictField(required=True)
  center = fields.CharField()
  date_modified = fields.DateTimeField(required=True)
  date_created = fields.DateTimeField(required=True)
  formType = fields.CharField()
  version = fields.IntegerField()

class PaymentStatusDetailItem(EmbeddedMongoModel):
  amount = money_field
  currency = currency_field
  date = fields.DateTimeField(required=True)
  method = fields.CharField(required=True)

class PaymentTrailItem(EmbeddedMongoModel):
  value = fields.DictField()
  date = fields.DateTimeField(required=True)
  method = fields.CharField(required=True)
  status = fields.CharField()
  id = fields.CharField()

class UpdateTrailItem(EmbeddedMongoModel):
  old = fields.DictField()
  new = fields.DictField()
  date = fields.DateTimeField(required=True)

class EmailTrailItem(EmbeddedMongoModel):
  value = fields.DictField()
  date = fields.DateTimeField(required=True)

# class PaymentInfoItem(EmbeddedMongoModel):
#   name = fields.CharField(required=True, min_length=1)
#   description = fields.CharField(required=True, min_length=1)
#   amount = fields.Decimal128Field(required=True)
#   quantity = fields.IntegerField(required=True)

# class PaymentInfo(EmbeddedMongoModel):
#   currency = currency_field
#   total = money_field
#   redirectUrl = fields.URLField()
#   items = fields.EmbeddedDocumentListField(PaymentInfoItem, blank=True, default=[])


class Response(BaseMongoModel):
  id = fields.ObjectIdField(primary_key=True)
  form = fields.ReferenceField(Form, on_delete=fields.ReferenceField.CASCADE)
  user = fields.EmbeddedDocumentField(User)
  # paymentInfo = fields.EmbeddedDocumentField(PaymentInfo)
  paymentInfo = fields.DictField()
  payment_status_detail = fields.EmbeddedDocumentListField(PaymentStatusDetailItem, blank=True, default=[])
  paid = fields.BooleanField(default=False)
  amount_paid = fields.CharField()
  payment_trail = fields.EmbeddedDocumentListField(PaymentTrailItem, blank=True, default=[])
  update_trail = fields.EmbeddedDocumentListField(UpdateTrailItem, blank=True, default=[])
  email_trail = fields.EmbeddedDocumentListField(EmailTrailItem, blank=True, default=[])
  value = fields.DictField()
  date_created = fields.DateTimeField(required=True)
  date_modified = fields.DateTimeField(required=True)

def serialize_model(model):
  """Serializes model so it is OK to send back as a JSON response.
  """
  if type(model) in (list, pymodm.queryset.QuerySet):
    return [serialize_model(m) for m in model]
  options = RELAXED_JSON_OPTIONS
  options.datetime_representation = DatetimeRepresentation.ISO8601
  model = json.loads(dumps(model.to_son().to_dict(),
    json_options=options
  ))
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