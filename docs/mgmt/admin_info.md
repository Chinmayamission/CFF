Responses store data in two keys: `value` and `admin_info`. `value` is owned by the user; `admin_info` is owned by the admin. Both are viewable by anyone with view permission to the response, though.

Only users with the permission `Responses_AdminInfo_Edit` can modify admin info. They can modify admin info by going to .

(Upcoming release, not added yet:) `formOptions.adminInfo.schema` and `formOptions.adminInfo.uiSchema` describe the schema and uiSchema for the admin info. These are used to render a form in the response detail, in a tab called "Admin Info".