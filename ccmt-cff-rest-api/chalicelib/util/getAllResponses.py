from pydash.objects import get
import json
import datetime
CACHE = {}

def get_all_responses(hash_name=None, **kwargs):
    """Gets *all* responses, paging through all results if necessary.
    """
    from ..main import TABLES
    if hash_name:
        cache = get(CACHE, hash_name)
        if cache and (cache["date"] - datetime.datetime.now()).total_seconds() < 100:
            responses = cache["value"]
            return responses
    queryResults = TABLES.responses.query(**kwargs)
    responses = queryResults["Items"]
    while "LastEvaluatedKey" in queryResults:
        queryResults = TABLES.responses.query(
            ExclusiveStartKey=queryResults["LastEvaluatedKey"],
            **kwargs
        )
        responses += queryResults["Items"]
    if hash_name:
        CACHE[hash_name] = {"date": datetime.datetime.now(), "value": responses}
    return responses