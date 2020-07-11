By default, users do not need to login to fill out forms. To set up user login for a form,
set `formOptions.loginRequired` to be equal to true:

```json
{
  "loginRequired": true
}
```

## General flow

When `loginRequired` is set to true:

- When going to the form link, users will be prompted to log in if they are not logged in already.
- When submitting the form, the user's response will be associated with them.
- Each user can only submit one response per form. When the user goes back to the form, they will
be presented with their existing response, which they can then edit (if form editing is enabled).

## Predicates

When a form has `loginRequired` set to true, the predicates feature can also be enabled to import
data from previous iterations of a particular form. See [Predicates](predicates.md) for more information.