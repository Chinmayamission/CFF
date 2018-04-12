def get_all_responses(**kwargs):
    """Gets _all_ responses, paging through all results if necessary.
    """
    from ..main import app, TABLES
    queryResults = TABLES.responses.query(**kwargs)
    responses = queryResults["Items"]
    while "LastEvaluatedKey" in queryResults:
        queryResults = TABLES.responses.query(
            ExclusiveStartKey=queryResults["LastEvaluatedKey"],
            **kwargs
        )
        responses += queryResults["Items"]
    return responses