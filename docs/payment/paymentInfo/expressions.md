CFF uses its own custom expression language to create payment expressions based on the value of a form's response. Payment expressions should be specified in both the `amount` and `quantity` values of elements of the `paymentInfo.items` array. For example:

``` json
{
    "amount": "participants * 10",
    "quantity": 1
}
```

!!! warning

        Payment expressions are evaluated by [expr-eval](https://github.com/silentmatt/expr-eval) on the frontend and [py-expression-eval](https://github.com/Axiacore/py-expression-eval) on the backend, so any value within them must be parseable by both libraries.

## Examples

### Constant value

The simplest example of a payment expression is a string that evaluates to a constant value.

``` 
500
```

You can also use expressions, as the following:

``` 
4 * 100 + 100
```

evaluates to `500` .

### Dynamic value

To use a dynamic value from the form data, simply add the name of the key in the expression and it will be substituted with the value.

For example, having an expression:

``` 
4 * age
```

with form data equal to 

``` json
{
    "age": 10
}
```

evaluates to `40` .

!!! note

    Note that all variables in payment expressions can be prepended by a dollar sign ( `$` ) -- so the previous example could be written as `4 * $age` -- these are both equivalent.

### Array lengths

If a variable in the expression corresponds to an array variable in the form data, it will be substituted by the length of the array. For example:

``` 
40 * participants
```

with form data equal to

``` json
{
    "participants": [
        {
            "name": "Test1"
        },
        {
            "name": "Test2"
        }
    ]
}
```

evaluates to `80` .

Note that this expression is essentially equal to the idea of charging "$40 per participant".

### Counting array items based on a condition

It is possible to count array items based on a condition by the expression `[path]:[value]` . For example, the following expression:

``` 
40 * amounts:1
```

with form data equal to

``` json
{
    "amounts": [1, 2, 3]
}
```

will evaluate to `40` .

You can also do this with objects. For example:

``` 
40 * (participants.age:1 + participants.age:2)
```

with form data equal to

``` json
{
    "participants": [
        {
            "age": 1
        },
        {
            "age": 2
        },
        {
            "age": 40
        }
    ]
}
```

will evaluate to `80` . Note that this is essentially equivalent to charging "$40 for 1- or 2- year olds".

!!! note

    This feature is limited because there is a limit to what characters can be entered in an expression, and ranges or more complex values cannot be easily specified in this format. A more generalized and powerful version of this construct is found in the `cff_countArray` function, mentioned below.

### Conditionally including items

It is possible to conditionally include values either by utilizing a boolean value in the form data or by adding a conditional operator ( `<` , `>` , `<=` , `>=` , `!=` , `==` ). Each conditional expression ( `a <= b` ) evaluates to either 0 or 1, which can then be added together to create an "or" operation or multiplied together to create an "and" operation.

For example:

``` 
100 * (participants > 2) + 50 * (participants < 1)
```

This expression will evaluate to `100` if the length of `participants` is greater than 2, but will be equal to `50` if the length of `participants` is less than 1.

Another example:

``` json
{
    "paymentInfo": {
        "items": [
            {
                "name": "Registration India",
                "description": "Registration India",
                "amount": "100",
                "quantity": "nationality:Indian"
            },
            {
                "name": "Registration Outside India",
                "description": "Registration Outside India",
                "amount": "1000",
                "quantity": "1 - nationality:Indian"
            }
        ]
    }
}
```

Note that in this case, we are able to use the `[key]:[value]` syntax to see if a particular form data value is equal to a given string. Here, we are charging 100 if the participant is from India, but 1000 if the participant is not from India.

<!-- TODO: document custom variables and functions such as $total -->

## Custom functions

CFF has defined some custom functions, all of which start with `cff_` , that can also be used in payment expressions:

### cff_createdBetween

`cff_createdBetween` checks if a form response was created between two specified dates, and returns `1` if true and `0` if false. Note that both dates must be in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format and in UTC.

``` 
cff_createdBetween("2019-09-18T16:53:26.238Z", "2019-09-18T18:53:26.238Z")
```

!!! warning

    Make sure you perform the appropriate timezone adjustment. Daylight savings time may require you to change the hour offset of the beginning and end dates differently, depending on how far apart they are.

This is useful for creating an "Early Bird" discount that may only apply for responses that were only created during a certain date:

``` json
{
  "paymentInfo": {
    "currency": "USD",
    "redirectUrl": "http://cmsj.org/",
    "items": [
      {
        "name": "2020 Bay Area CHYK Presidents' Day Weekend Retreat Early Bird Registration",
        "description": "Early Bird Registration",
        "amount": "191",
        "quantity": "cff_createdBetween('2019-11-26T08:00:00.000Z', '2020-01-01T08:00:00.000Z')"
      },
      {
        "name": "2020 Bay Area CHYK Presidents' Day Weekend Retreat Regular Registration",
        "description": "Regular Registration",
        "amount": "241",
        "quantity": "cff_createdBetween('2020-01-01T08:00:00.000Z', '2020-02-05T08:00:00.000Z')"
      }
    ]
  }
}
```

### cff_yeardiff

`cff_yeardiff` calculates the difference, in years, between the two dates are passed to it. Both dates have to be in YYYY-MM-DD format. A sample use case for this is calculating someone's age based on their date of birth.

For example:

``` 
cff_yeardiff('2019-09-01', dob)
```

with form data equal to

``` json
{
    "dob": "1999-01-12"
}
```

evaluates to `20`.

### cff_countArray

cff_countArray counts the number of times the given expression is true within an array. For example:

``` 
cff_countArray(CFF_FULL_participants, "age > 2")
```

with form data equal to

``` json
[
    { "age": 3 },
    { "age" : 1 }
]
```

Will return a value of `1` .

Note that the expression in the second argument to `cff_countArray` must be surrounded in double quotes (so should be escaped in JSON by using `\"`).

Note that "CFF_FULL_" must be added as a prefix to any variable that should return a non-numeric value (such as an array). For example, `CFF_FULL_participants` returns the actual value of `participants` so it can be used in the function; just putting in `participants` will return the length of the array, 3.

### cff_today (backend only)

`cff_today()` returns today's date as a string in YYYY-MM-DD format -- for example, 2019-07-18.

### cff_addDuration (backend only)

`cff_addDuration(date, duration)` adds `duration` to `date` , returning a date string in `YYYY-MM-DD` format. `date` must be specified in `YYYY-MM-DD` format and `duration` must be specified in the [ISO Duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format.

For example, `cff_addDuration(cff_today(), "P1M")` adds one month to the current year.

`cff_addDuration("2000-01-01", "P2M")` should return `"2000-03-01"` .

### cff_nthOfNextMonth (backend only)

`cff_nthOfNextMonth(date, n, maxDayDiff)` gives the next `n` th day of the month following `date` . If `maxDayDiff` is specified and this day is less than `maxDayDiff` away from `date` , then the month is increased by 1.
