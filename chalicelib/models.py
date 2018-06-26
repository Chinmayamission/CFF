from pymongo import TEXT
from pymodm import connect, fields, MongoModel, EmbeddedMongoModel

class Center(EmbeddedMongoModel):
  name = fields.CharField()

class User(EmbeddedMongoModel):
  name = fields.CharField()
  email = fields.EmailField()
  id = fields.CharField()

class Form(MongoModel):
  name = fields.CharField()
  id = fields.ObjectIdField(primary_key=True)
  schema = fields.DictField()
  uiSchema = fields.DictField()
  formOptions = fields.DictField()
  cff_permissions = fields.DictField(mongo_name="cff:permissions")
  center = fields.CharField()
  date_modified = fields.DateTimeField()
  date_created = fields.DateTimeField()
  type = fields.CharField() # "formMetadata"
  formType = fields.CharField()
  version = fields.IntegerField()

class Response(MongoModel):
  id = fields.ObjectIdField(primary_key=True)
  form = fields.ReferenceField(Form)
  user = fields.EmbeddedDocumentField(User)
  payment_status_detail = fields.ListField(fields.DictField())
  paid = fields.BooleanField()
  payment_trail = fields.ListField(fields.DictField())
  update_trail = fields.ListField(fields.DictField())
  value = fields.DictField()
  date_created = fields.DateTimeField()
  date_modified = fields.DateTimeField()
  type = fields.CharField()
  type = fields.CharField() # "formResponse"

def serialize_model(model):
  """Serializes model so it is OK to send back as a JSON response.
  """
  dict_ = model.to_son().to_dict()
  for k, v in dict_.items():
    if type(v) not in (str, int, float, type(None)):
      dict_[k] = str(v)
  print(dict_)
  return dict_