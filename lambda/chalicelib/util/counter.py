from chalicelib.models import FormResponseCounter
from bson.objectid import ObjectId
from pymongo import ReturnDocument


def get_counter(formId):
    """Get the latest counter from the FormResponseCounter that is associated
    with the given form id.
    """
    doc = FormResponseCounter.objects.all()._collection.find_one_and_update(
        {"_cls": "chalicelib.models.FormResponseCounter", "form": ObjectId(formId)},
        {"$inc": {"counter": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return doc["counter"]
