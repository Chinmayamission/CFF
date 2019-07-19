There are many expressions understood by ExpresssionParser.

# Custom Functions

## cff_yeardiff
`cff_yeardiff` calculates the difference, in years, between the two dates are passed to it. Both dates have to be in YYYY-MM-DD format. A sample use case for this is calculating someone's age based on their date of birth.

For example, having the following for the expression:

```
cff_yeardiff('2019-09-01', dob)
```

When the form data is:

```
{"dob": '1999-01-12'}
```

Will make the final result evaluate to `20`.

# cff_countArray
cff_countArray counts the number of times the given expression is true within an array. Example:

```
cff_countArray(CFF_FULL_participants, "age > 2")
```

With data:
```
[
    {age: 3},
    {age: 1}
]
```

Will return a value of `1`.

Note that "CFF_FULL_" must be added as a prefix to any variable that should return a non-numeric value (such as an array). For example, `CFF_FULL_participants` returns the actual value of `participants` so it can be used in the function; just putting in `participants` will return the length of the array, 3.

# cff_today (backend only)
`cff_today()` returns today's date as a string in YYYY-MM-DD format -- for example, 2019-07-18

# cff_addDuration (backend only)
`cff_addDuration(date, duration)` adds `duration` to `date`, returning a date string in `YYYY-MM-DD` format. `date` must be specified in `YYYY-MM-DD` format and `duration` must be specified in the [ISO Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format.

For example, `cff_addDuration(cff_today(), "P1M")` adds one month to the current year.

`cff_addDuration("2000-01-01", "P2M")` should return `"2000-03-01"`.

# cff_nthOfNextMonth (backend only)
`cff_nthOfNextMonth(date, n, maxDayDiff)` gives the next `n`th day of the month following `date`. If `maxDayDiff` is specified and this day is less than `maxDayDiff` away from `date`, then the month is increased by 1.