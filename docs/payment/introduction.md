Forms can be integrated with payment methods. There are two JSON properties on formOptions that control payment:

- `formOptions.paymentInfo` - configures the actual payment calculation of the form. Based on the configuration specified in this field, you can configure how the final payment amounts are calculated based on form data, the payment currency, and more.

- `formOptions.paymentMethods` - configures the payment methods that the form is connected to. A form can be connected to a single payment method, multiple payment methods, or none.