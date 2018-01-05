/// <reference path="../interfaces.d.ts"/>
import * as React from 'react';
import Paypal from "./paypal";
import CCAvenue from "./CCAvenue";

let Components = {
    "paypal": Paypal,
    "ccavenue": CCAvenue
};
class Payment extends React.Component<IPaymentProps, any> {

 render() {
     if (!this.props.schemaMetadata.paymentMethods) {
        return "";
     }
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
            "responseId": this.props.responseId
            // todo: get user's entered data.
        }
        return React.createElement(MyComponent, props);
     });
 }
} 
export default Payment;