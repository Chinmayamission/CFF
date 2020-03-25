To enable form login, add the following to formOptions:

```json
{
    "loginRequired": true
}
```

- Each form will be associated with the user who filled it out.
- *Only* that user may fill out that form.
- Modify links will send the user to a login screen if they have not already logged in, and when they log in, they will be shown their unique response for that form if present.

## Login Lookup
If you need to transition an existing anonymous-access form to a `loginRequired` form, set the `loginLookup` attribute.

```json
{
    "loginRequired": true,
    "loginLookup": true
}
```

Now, going to the form or a response page will show the login screen. However, the user will not be able to sign up for a new account, but will rather be prompted for their email address to look up an existing registration. Then, once they confirm their email, they will be redirected to the form.