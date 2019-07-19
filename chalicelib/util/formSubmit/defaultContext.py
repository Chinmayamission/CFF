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

def cff_nthOfNextMonth(datestr, n, maxDayDiff=None):
    """Returns nth day of the next month after datestr.
    If the return date is less than maxDayDiff away from date, then go to the next month.
    """
    date = datetime.strptime(datestr, "%Y-%m-%d")
    new_date = date.replace(month=date.month + 1, day=n)
    if maxDayDiff and relativedelta(new_date, date).days < maxDayDiff:
        new_date = new_date.replace(month=new_date.month + 1)
    return new_date.strftime("%Y-%m-%d")

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

def cff_today():
    return date.today().strftime("%Y-%m-%d")

def cff_addDuration(dt, duration):
    dt = datetime.strptime(dt, "%Y-%m-%d")
    duration = parse_duration(duration)
    new_time = dt + relativedelta(
        months=int(getattr(duration, "months", 0)),
        days=int(getattr(duration, "days", 0)),
        years=int(getattr(duration, "years", 0))
    )
    return new_time.strftime("%Y-%m-%d")

DEFAULT_CONTEXT = {
    "cff_yeardiff": cff_yeardiff,
    "cff_nthOfNextMonth": cff_nthOfNextMonth,
    "cff_countArray": cff_countArray,
    "cff_addDuration": cff_addDuration,
    "cff_today": cff_today
}