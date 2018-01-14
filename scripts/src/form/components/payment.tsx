/// <reference path="../interfaces.d.ts"/>
import * as React from 'react';
import Paypal from "./paypal";
import CCAvenue from "./CCAvenue";
import {clone} from "lodash-es";

let Components = {
    "paypal": Paypal,
    "ccavenue": CCAvenue
};
class Payment extends React.Component<IPaymentProps, any> {
    constructor(props: any) {
        super(props);
        let paymentInfo_owed : any = clone(props.paymentInfo);
        if (this.props.paymentInfo_old) {
            paymentInfo_owed.total = parseFloat(this.props.paymentInfo.total) - parseFloat(this.props.paymentInfo_old.total);
        }
        this.state = {
          paymentInfo_owed: paymentInfo_owed
        };
      }

    getPaymentMethods() {
        let paymentMethods = Object.keys(this.props.paymentMethods);
        return paymentMethods.map((paymentMethod) => {
            var MyComponent = Components[paymentMethod];
            console.log('option is', paymentMethod);
            let props = {
                "paymentInfo": this.props.paymentInfo,
                "paymentMethodInfo": this.props.paymentMethods[paymentMethod],
                "key": paymentMethod,    // must be unique.
                "onPaymentComplete": this.props.onPaymentComplete,
                "onPaymentError": this.props.onPaymentError,
                "responseId": this.props.responseId,
                "formId": this.props.formId,
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
    formatPaymentInfo(paymentInfo : IPaymentInfo) {
        return this.formatPayment(paymentInfo.currency, paymentInfo.total);
    }
    render() {
        if (!this.props.paymentMethods) {
            return "";
        }
        return <div><br />
            <h1>Pay Now</h1>
            <div>
            {this.props.paymentInfo_old && 
                <div>
                    <div>Previous Amount: {this.formatPaymentInfo(this.props.paymentInfo_old)}</div>
                    <div>New Amount: {this.formatPaymentInfo(this.props.paymentInfo)}</div>
                </div>
            }
            <div><b>Amount Owed: {this.formatPaymentInfo(this.state.paymentInfo_owed)} </b></div>
            </div>
            <p>Please select a payment method to complete the form. You will receive a confirmation email after the payment is complete.</p><br />
            <div style={{ "textAlign": "center" }}>
                {this.getPaymentMethods()}
            </div>
        </div>;

    }
}
export default Payment;