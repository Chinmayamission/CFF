/// <reference path="../interfaces.d.ts"/>
import * as React from 'react';
import Paypal from "./paypal";
import CCAvenue from "./CCAvenue";

let Components = {
    "paypal": Paypal,
    "ccavenue": CCAvenue
};
class Payment extends React.Component<IPaymentProps, any> {
    getPaymentMethods() {
        let paymentMethods = Object.keys(this.props.schemaMetadata.paymentMethods);
        return paymentMethods.map((paymentMethod) => {
            var MyComponent = Components[paymentMethod];
            console.log('option is', paymentMethod);
            let props = {
                "paymentInfo": this.props.schemaMetadata.paymentInfo,
                "paymentMethodInfo": this.props.schemaMetadata.paymentMethods[paymentMethod],
                "key": paymentMethod,    // must be unique.
                "onPaymentComplete": this.props.onPaymentComplete,
                "onPaymentError": this.props.onPaymentError,
                "responseId": this.props.responseId,
                "apiEndpoint": this.props.apiEndpoint
                // todo: get user's entered data.
            }
            return React.createElement(MyComponent, props);
        });
    }
    formatPayment(currency, total) {
        if (currency == "USD") {
            return "$" + total;
        }
        else {
            return currency + " " + total;
        }
    }
    render() {
        if (!this.props.schemaMetadata.paymentMethods) {
            return "";
        }
        return <div><br />
            <h1>Pay Now</h1>
            <p>
            <b>Total Amount: {this.formatPayment(this.props.schemaMetadata.paymentInfo.currency, this.props.schemaMetadata.paymentInfo.total)}</b>
            </p>
            <p>Please select a payment method to complete the form. You will receive a confirmation email after the payment is complete.</p><br />
            <div style={{ "textAlign": "center" }}>
                {this.getPaymentMethods()}
            </div>
        </div>;

    }
}
export default Payment;