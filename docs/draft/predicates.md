You can add form "predicates". This feature is used in order to import data from a previous year's iteration of the form. Use cases for this feature include:
- CMA Marietta used CFF for 2018 Balavihar Registration, and wants to do the same for 2019 Balavihar Registration. However, they would like for existing users' data to be imported, and for the grades to be bumped up one level.
- Sometimes some users might have made automatic "recurring payments" (such as Parivar) in the past through a previous form, which should automatically give them credit for the current year so they don't have to pay for it.

CFF supports a limited version of this through `formOptions.predicate` property.

## Simple usage
Just add the following to `formOptions`:

```json
{
    "predicate": {
        "formId": "abcd"
    }
}
```

`predicate.formId` - Form ID that counts as the predicate. By default, the response that is owned by the current user is loaded; so this feature is currently only supported for `loginRequired` forms. In the future, it could be possible to support matching by email, etc.

Note that the backend endpoint (`/forms/{formId}/response`) only searches for predicates that are already paid; so unpaid predicates will not be found and sent back from this endpoint.

## Applying patches
Sometimes you may want to modify the data to apply patches, such as promoting children up a grade. This is how you do so:

```json
{
    "predicate": {
        "formId": "abcd",
        "patches": [{"unwind": "/participants", "type": "walk", "items": ["A","B","C"], "path": "/grade"}]
    }
}
```

`predicate.patches` - A list of patches to apply to the response. All the patches get sequentially applied to the form data. Above is an example of a "walk" patch, which will transform each "grade" and walk it up by 1 (A -> B, B -> C, otherwise will stay the same). The "unwind" parameter applies this patch to every element in the `participants` array.

## Propagating paid status for recurring payments
In this use case, imagine that people signed up for Balavihar in 2019 and did recurring payments. You want those *previous* recurring payments, if they are still active, to allow for a certain discount (such as a % off, or giving free,) this year as well.

When the import happens, the `predicate` property of the response is set to the id of the predicate. (todo: do this in formResponseNew). (todo: allow paymentInfo.items to include this property and work on frontend, validate on backend.)

```json
"paymentInfo": {
    "items": [
        {
            "name": "$50 new member fee",
            "description": "desc",
            "amount": "50",
            "quantity": "1 - $PREDICATE"
        }
    ]
}
```

We need to store RECURRING_ACTIVE on both the predicate and current response, updating everything as needed when RECURRING_ACTIVE is changed. The following configuration makes the current response have a $0 amount_owed when RECURRING_ACTIVE is true:

```json
"paymentInfo": {
    "items": [
        {
            "name": "Full discount for recurring payment members",
            "description": "desc",
            "amount": "-1 * $total",
            "quantity": "$RECURRING_ACTIVE"
        }
    ]
}
```

## Customizing warning text
By default, when a new response is created with a predicate, the following shows up:

[insert image here]

To customize this text, edit the `predicates.warningText` property:
```json
"predicate": {
    "warningText": "<b>Warning:</b> you are submitting a form based old information from a predicate form."
}
```