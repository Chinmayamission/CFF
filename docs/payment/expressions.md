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