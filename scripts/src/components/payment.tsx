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
     if (!this.props.schema.paymentMethods) {
        return "";
     }
     let paymentMethods = Object.keys(this.props.schema.paymentMethods);
     return paymentMethods.map((paymentMethod) => {
        var MyComponent = Components[paymentMethod];
        console.log('option is', paymentMethod);
        let props = {
            "paymentInfo": this.props.schema.paymentInfo,
            "paymentMethodInfo": this.props.schema.paymentMethods[paymentMethod],
            "key": paymentMethod,    // must be unique.
            "onPaymentComplete": this.props.onPaymentComplete,
            "onPaymentError": this.props.onPaymentError
            // todo: get user's entered data.
        }
        return React.createElement(MyComponent, props);
     });
 }
} 
export default Payment;