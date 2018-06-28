from pymongo import TEXT
from pymodm import connect, fields, MongoModel, EmbeddedMongoModel
from bson.objectid import ObjectId
import datetime
import os

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

class Form(BaseMongoModel):
  name = fields.CharField()
  id = fields.ObjectIdField(primary_key=True)
  schema = fields.DictField()
  uiSchema = fields.DictField()
  formOptions = fields.DictField()
  cff_permissions = fields.DictField()
  center = fields.CharField()
  date_modified = fields.DateTimeField()
  date_created = fields.DateTimeField()
  formType = fields.CharField()
  version = fields.IntegerField()

class Response(MongoModel):
  id = fields.ObjectIdField(primary_key=True)
  form = fields.ReferenceField(Form, on_delete=fields.ReferenceField.CASCADE)
  user = fields.EmbeddedDocumentField(User)
  paymentInfo = fields.DictField()
  payment_status_detail = fields.ListField(fields.DictField())
  paid = fields.BooleanField()
  payment_trail = fields.ListField(fields.DictField())
  update_trail = fields.ListField(fields.DictField())
  value = fields.DictField()
  date_created = fields.DateTimeField()
  date_modified = fields.DateTimeField()

def serialize_model(model):
  """Serializes model so it is OK to send back as a JSON response.
  """
  if type(model) is list:
    return [serialize_model(m) for m in model]
  dict_ = model.to_son().to_dict()
  for k in list(dict_):
    v = dict_[k]
    if k == "_cls":
      del dict_[k]
    elif type(v) not in (str, int, float, dict, type(None)):
      dict_[k] = str(v)
  return dict_