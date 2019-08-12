def get_versions(self, collection, id, limit=None):
    kwargs = {
        "KeyConditionExpression": Key("id").eq(id),
        "ProjectionExpression": "version, date_created, date_last_modified",
        "ScanIndexForward": False,  # sort in descending order.
    }
    if limit:
        kwargs["Limit"] = limit
    return collection.query(**kwargs)["Items"]
