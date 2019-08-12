In the "Share" tab, you can enter an email address to share it with someone and also assign them permissions.

Here is a list of form permissions and what each one does:

| Name      | Description |
| ----------- | ----------- |
|  owner  | All permissions |
|  Responses_View  | View Responses |
|  Responses_Export  | Export Responses as CSV (not implemented yet) |
|  Responses_ViewSummary  | View Response Summary (not implemented yet) |
|  Responses_Edit  | Edit a Response |
|  Responses_Delete  | Delete a Response |
|  Responses_AddPayment  | Add a payment to a response (which could or could not send a confirmation email) |
|  Forms_Edit  | Edit a form |
|  Forms_PermissionsView  | View permissions for a form |
|  Forms_PermissionsEdit | Edit permissions for a form |

TBD / upcoming permissions:

| Name      | Description |
| ----------- | ----------- |
|  Responses_AdminInfo_Edit | Edit a Response's AdminInfo |
|  Responses_CheckIn  | View response list, edit response values ending in ".checkin" |

## Organizations
Organizations are a feature that allow you to restrict which users can perform certain tasks, which are not tied to a particular form. For example, you may want to restrict users from creating forms.

To do that, add an entry in the database with the following structure:
```
{
    "_cls": "chalicelib.models.Org",
    "name": "CCMT",
    "cff_permissions": {
        "[userId1]": {"Orgs_FormsCreate": true}
    }
}
```

This will allow only the user with id [userId1] to create forms. For now, there is only one organization -- CCMT -- in the database. More may be added later.

List of permissions that can be applied to an organization:

| Name      | Description |
| ----------- | ----------- |
|  Forms_Create  | All permissions |

Planned (TBD) permissions:

| Name      | Description |
| ----------- | ----------- |
|  Forms_Delete  | Delete forms |
|  superuser  | All permissions |