When showing a payment table (such as in the confirmation email), you have the following object to work with:

```
{
    "currency": "USD",
    "total": 4,
    "items": [
        {
            "name": "Name",
            "description": "Name",
            "amount": 2,
            "quantity": 2,
            "total": 4
        }
    ]
}
```

Note that the `total` key in each element in `items` represents a single subtotal (`amount * quantity`), while `paymentInfo.total` represents the total amount owed, adding up all paymentInfo items.

## Notes for installment items

Note that the totals for installment items (with `installment: true`) are not summed up when calculating `paymentInfo.total`.

When `recurrenceTimes` is specified for an item, then the `total` calculated for that item is equal to `amount * quantity * recurrenceTimes`. This applies only to installment items. However, it might make most sense not to show `quantity` or `total` for installment payments.