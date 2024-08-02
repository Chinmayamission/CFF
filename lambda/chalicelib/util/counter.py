from chalicelib.models import FormResponseCounter
from bson.objectid import ObjectId
from pymongo import ReturnDocument


def get_counter(formId, key):
    """Get the latest counter from the FormResponseCounter that is associated
    with the given form id.
    """
    query = {"_cls": "chalicelib.models.FormResponseCounter", "form": ObjectId(formId)}
    if key:
        query["key"] = key
    doc = FormResponseCounter.objects.all()._collection.find_one_and_update(
        query,
        {"$inc": {"counter": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return doc["counter"]
