To enable form login, add the following to formOptions:

```json
{
    "loginRequired": true
}
```

The behavior will be as follows:
- Each form will be associated with the user who filled it out.
- *Only* that user may fill out that form.
- Modify links will send the user to a login screen if they have not already logged in. User must be logged in as that repsonse's owner to edit. (?)

Todo
- Fix bug - when going to a modify link, another user should be able to edit it.