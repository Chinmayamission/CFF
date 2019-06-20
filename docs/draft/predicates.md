You can add form "predicates". This feature is used in order to import data from a previous year's iteration of the form. Use cases for this feature include:
- CMA Marietta used CFF for 2018 Balavihar Registration, and wants to do the same for 2019 Balavihar Registration. However, they would like for existing users' data to be imported, and for the grades to be bumped up one level.
- Sometimes some users might have made automatic "recurring payments" (such as Parivar) in the past through a previous form, which should automatically give them credit for the current year so they don't have to pay for it.

CFF supports a limited version of this through `formOptions.predicates` property.

{
    "predicates": {
        "formId": "....",
        "patches": [
            [{ "op": "add", "path": "/biscuits/1", "value": { "name": "Ginger Nut" } }], // patch 1
            [{ "op": "remove", "path": "/biscuits/1" }], // patch 2
        ]
    }
}

`predicates.formId` - Form ID that counts as the predicate. By default, the response that is owned by the current user is loaded; so this feature is currently only supported for `loginRequired` forms. In the future, it could be possible to support matching by email, etc.

`predicates.patches` - A list of patches to apply to the response, in [JSON Patch](http://jsonpatch.com/) format.