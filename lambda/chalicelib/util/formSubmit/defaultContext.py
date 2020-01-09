from datetime import datetime, date, timezone
import dateutil
from dateutil.relativedelta import relativedelta
import re
from .util import calculate_price, DELIM_VALUE_REGEX, DOT_VALUE_REGEX
from isodate import parse_duration, parse_datetime
import pytz


def create_default_context(numeric, responseMetadata):
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
        if type(datestr) is not str or type(n) is not int or n <= 0:
            return None
        date = datetime.strptime(datestr, "%Y-%m-%d")
        new_date = (date + relativedelta(months=1)).replace(day=n)
        if maxDayDiff and (new_date - date).days < maxDayDiff:
            new_date = new_date + relativedelta(months=1)
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
        return len(
            [
                item
                for item in array
                if calculate_price(expression, item, numeric, responseMetadata)
            ]
        )

    def cff_today():
        return date.today().strftime("%Y-%m-%d")

    def cff_addDuration(dt, duration):
        if type(dt) is not str:
            return None
        dt = datetime.strptime(dt, "%Y-%m-%d")
        duration = parse_duration(duration)
        new_time = dt + relativedelta(
            months=int(getattr(duration, "months", 0)),
            days=int(getattr(duration, "days", 0)),
            years=int(getattr(duration, "years", 0)),
        )
        return new_time.strftime("%Y-%m-%d")

    def cff_createdBetween(datestr1, datestr2):
        if type(datestr1) is not str or type(datestr2) is not str:
            return 0
        datestr1 = re.sub(
            DOT_VALUE_REGEX, ".", re.sub(DELIM_VALUE_REGEX, ":", datestr1)
        )
        datestr2 = re.sub(
            DOT_VALUE_REGEX, ".", re.sub(DELIM_VALUE_REGEX, ":", datestr2)
        )
        d1 = parse_datetime(datestr1)
        d2 = parse_datetime(datestr2)
        date_created = responseMetadata.get("date_created", None)
        date_created = (
            parse_datetime(date_created) if date_created is not None else datetime.now()
        )
        # Convert date_created from a naive to an aware datetime,
        # so that it can be compared with the naive datetimems d1 and d2.
        # PyMongo always stores naive datetimes in UTC, so this is ok.
        date_created = date_created.replace(tzinfo=pytz.utc)
        return (date_created >= d1) and (date_created <= d2)

    DEFAULT_CONTEXT = {
        "cff_yeardiff": cff_yeardiff,
        "cff_nthOfNextMonth": cff_nthOfNextMonth,
        "cff_countArray": cff_countArray,
        "cff_addDuration": cff_addDuration,
        "cff_today": cff_today,
        "cff_createdBetween": cff_createdBetween,
    }
    return DEFAULT_CONTEXT
