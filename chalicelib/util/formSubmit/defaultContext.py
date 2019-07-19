from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from .util import calculate_price
from isodate import parse_duration

def cff_yeardiff(datestr1, datestr2):
    if type(datestr1) is not str or type(datestr2) is not str:
        return 0
    d1 = datetime.strptime(datestr1, "%Y-%m-%d")
    d2 = datetime.strptime(datestr2, "%Y-%m-%d")
    return relativedelta(d1, d2).years

# def cff_countArray(array, expression):
#     return len([item for item in array if calculate_price(expression, item)])

def cff_countArray(*args):
    # TODO: fix py-expression-eval so that the method signature above is called.
    # Same applies to cff_addDuration.
    array = list(args)
    expression = array.pop(-1)
    if type(array) is not list:
        return 0
    return len([item for item in array if calculate_price(expression, item)])

def cff_now():
    return date.today().strftime("%Y-%m-%d")

def cff_addDuration(*args):
    dt = args[0]
    duration = args[1]
    dt = datetime.strptime(dt, "%Y-%m-%d")
    duration = parse_duration(duration)
    new_time = dt + relativedelta(
        months=int(getattr(duration, "months", 0)),
        days=int(getattr(duration, "days", None)),
        years=int(getattr(duration, "years", None))
    )
    return new_time.strftime("%Y-%m-%d")

DEFAULT_CONTEXT = {
    "cff_yeardiff": cff_yeardiff,
    "cff_countArray": cff_countArray,
    "cff_addDuration": cff_addDuration,
    "cff_now": cff_now
}