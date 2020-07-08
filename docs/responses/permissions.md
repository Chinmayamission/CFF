# Response permissions

By default, people cannot anonymously view or edit responses by link. If you want to allow people to anonymously view / edit responses with only the link, set the following in formOptions:

```
  "responseCanViewByLink": true,
  "responseCanEditByLink": true
```

## Permissions for login required forms

Note that the above two permissions do not have any effect for forms that require login (forms that have `loginRequired` set to true).
By default, a login required form always prompts users to log in when they go to the form, and it allows users to modify
their existing response by default.

If you want to disable modification of users' existing responses for a login required form, set the following in `formOptions`:

```json
{
  "responseModificationEnabled": false
}
```

If you want to disable submission of users' existing responses altogether for a login required form, set the following in `formOptions`:

```json
{
  "responseSubmissionEnabled": false
}
```