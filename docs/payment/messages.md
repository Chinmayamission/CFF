`formOptions.messages` can be used to override certain default messages. Here are the supported messages:

## Modify title at top of confirmation page

`formOptions.messages.confirmationPageTitle` - used to override the title at the confirmation page, by default "Confirmation Page".

## Modify message at top of confirmation page

`formOptions.messages.confirmationPageNoticeTop` - used to override the message at the top with the yellow background, which is by default, "Please scroll down and review your registration details in order to continue."

## Modify text before payment buttons

For the confirmation page, you can modify the text that shows before the payment buttons with the `formOptions.paymentInfo.description` attribute.

`paymentInfo.description` can now be specified by a [Jinja](http://jinja.pocoo.org/) template, as well.

## Modify title above payment table

By default, the title above the payment table on the confirmation page says "Payment". To override this, set the `paymentInfo.paymentInfoTableTitle` property.

```json
{
  "paymentInfoTableTitle": "Payment Details"
}
```