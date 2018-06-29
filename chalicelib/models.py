from pymongo import TEXT
from pymodm import connect, fields, MongoModel, EmbeddedMongoModel
from bson.objectid import ObjectId
import datetime
import os
import pymodm

currency_field = fields.CharField(required=True, choices=("USD", "INR"))
money_field = fields.Decimal128Field(required=True, min_value=0)

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

# class PaymentInfoItem(EmbeddedMongoModel):
#   name = fields.CharField(required=True, min_length=1)
#   description = fields.CharField(required=True, min_length=1)
#   amount = fields.Decimal128Field(required=True)
#   quantity = fields.IntegerField(required=True)

# class PaymentInfo(EmbeddedMongoModel):
#   currency = currency_field
#   total = money_field
#   redirectUrl = fields.URLField()
#   items = fields.EmbeddedDocumentListField(PaymentInfoItem)


class Response(BaseMongoModel):
  id = fields.ObjectIdField(primary_key=True)
  form = fields.ReferenceField(Form, on_delete=fields.ReferenceField.CASCADE)
  user = fields.EmbeddedDocumentField(User)
  # paymentInfo = fields.EmbeddedDocumentField(PaymentInfo)
  paymentInfo = fields.DictField()
  payment_status_detail = fields.EmbeddedDocumentListField(PaymentStatusDetailItem)
  paid = fields.BooleanField()
  amount_paid = fields.Decimal128Field(min_value=0)
  payment_trail = fields.EmbeddedDocumentListField(PaymentTrailItem)
  update_trail = fields.EmbeddedDocumentListField(UpdateTrailItem)
  value = fields.DictField()
  date_created = fields.DateTimeField(required=True)
  date_modified = fields.DateTimeField(required=True)

def serialize_model(model):
  """Serializes model so it is OK to send back as a JSON response.
  """
  if type(model) in (list, pymodm.queryset.QuerySet):
    return [serialize_model(m) for m in model]
  dict_ = model.to_son().to_dict()
  for k in list(dict_):
    v = dict_[k]
    if k == "_cls":
      del dict_[k]
    elif type(v) not in (str, int, float, dict, type(None)):
      dict_[k] = str(v)
  return dict_