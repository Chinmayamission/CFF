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
``

Will make the final result evaluate to `20`.