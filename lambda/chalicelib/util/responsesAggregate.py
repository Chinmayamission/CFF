from pydash import flatten
from pydash.objects import get
from pydash.arrays import compact
from pydash.collections import group_by


def aggregate(data, options):
    """Helper function."""
    finalData = {}
    if "aggregateCols" in options and type(options["aggregateCols"]) is list:
        for aggregateCol in options["aggregateCols"]:
            if type(aggregateCol) is str:
                aggregateColName, aggregateColDisplayName = aggregateCol, aggregateCol
                filterFunc = lambda x: len(x)
            elif "colName" in aggregateCol and "filter" in aggregateCol:
                filterKey, filterValues = "", ""
                filterItem = aggregateCol["filter"]
                if "key" in filterItem and "value" in filterItem:
                    filterKey, filterValues = filterItem["key"], filterItem["value"]
                    if type(filterValues) is not list:
                        filterValues = [filterValues]
                aggregateColName = aggregateCol["colName"]
                aggregateColDisplayName = aggregateCol.get(
                    "title", ""
                ) or "{}-{}-{}".format(aggregateCol["colName"], filterKey, filterValues)
                filterFunc = lambda x: sum(
                    1 if get(xi, filterKey) in filterValues else 0 for xi in x
                )
            else:
                continue
            finalData[aggregateColDisplayName] = {
                str(k): filterFunc(v)
                for k, v in group_by(data, aggregateColName).items()
            }
            finalData[aggregateColDisplayName]["TOTAL"] = sum(
                finalData[aggregateColDisplayName].values()
            )
    return finalData


def aggregate_data(dataOptions, responses):
    if "mainTable" in dataOptions and dataOptions["mainTable"]:
        dataOptions["mainTable"] = aggregate(responses, dataOptions["mainTable"])
    if "unwindTables" in dataOptions:
        for unwindCol in dataOptions["unwindTables"]:
            unwoundRes = [get(response["value"], unwindCol) for response in responses]
            unwoundRes = compact(flatten(unwoundRes))
            dataOptions["unwindTables"][unwindCol] = aggregate(
                unwoundRes, dataOptions["unwindTables"][unwindCol]
            )
    return dataOptions
