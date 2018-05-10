/// <reference path="../interfaces.d.ts"/>
import * as React from 'react';
import PaymentTable from "./PaymentTable";
import Paypal from "./paypal";
import PaypalClassic from "./PaypalClassic";
import CCAvenue from "./CCAvenue";
import {clone} from "lodash-es";
import ReactTable from 'react-table';
import * as DOMPurify from 'dompurify';

let Components = {
    "paypal_rest": Paypal,
    "paypal_classic": PaypalClassic,
    "ccavenue": CCAvenue
};
class Payment extends React.Component<IPaymentProps, any> {
    constructor(props: any) {
        super(props);
      }

    getPaymentMethods() {
        let paymentMethods = Object.keys(this.props.paymentMethods);
        return paymentMethods.map((paymentMethod) => {
            var MyComponent = Components[paymentMethod];
            if (!MyComponent) return;
            console.log('option is', paymentMethod);
            let props = {
                "paymentInfo_owed": this.props.paymentInfo_owed,
                "paymentInfo_received": this.props.paymentInfo_received,
                "paymentInfo": this.props.paymentInfo,
                "paymentMethodInfo": this.props.paymentMethods[paymentMethod],
                "key": paymentMethod,    // must be unique.
                "onPaymentComplete": this.props.onPaymentComplete,
                "onPaymentError": this.props.onPaymentError,
                "responseId": this.props.responseId,
                "formId": this.props.formId,
                "apiEndpoint": this.props.apiEndpoint,
                "formData": this.props.formData
                // todo: get user's entered data.
            }
            return React.createElement(MyComponent, props);
        });
    }
    formatPayment(total, currency="USD") {
        if (Intl && Intl.NumberFormat) {
            return Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(total);
        }
        else {
            return total + " " + currency;
        }
    }
    formatPaymentInfo(paymentInfo : IPaymentInfo) {
        return this.formatPayment(paymentInfo.total, paymentInfo.currency);
    }
    render() {
        if (!this.props.paymentMethods) {
            return "";
        }
        return <div><br />
            <h1>Pay Now</h1>
            <div>
            {this.props.paymentInfo &&
                <PaymentTable paymentInfo={this.props.paymentInfo} />
            }
            {this.props.paymentInfo_received && 
                <div>
                    <div>Amount Already Paid: {this.formatPaymentInfo(this.props.paymentInfo_received)}</div>
                </div>
            }
            {this.props.paymentInfo_owed.total > 0 &&
                <div><b>Amount Owed: {this.formatPaymentInfo(this.props.paymentInfo_owed)} </b></div>
            }
            {this.props.paymentInfo_owed.total < 0 &&
                <div>
                    <b>Amount Overpaid: {this.formatPaymentInfo(this.props.paymentInfo_owed)} </b>
                    <p>Please contact us if you would like a refund, or, otherwise, this money will serve as a donation.</p>
                </div>
            }
            </div>
            <div style={{ "textAlign": "center" }}>
                {this.props.paymentInfo_owed.total > 0 && 
                    <div>
                        <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(this.props.paymentInfo.description || "Please select a payment method to complete the form. You will receive a confirmation email after the payment is complete.") }} />
                        {this.getPaymentMethods()}
                    </div>
                }
                {this.props.paymentInfo_owed.total == 0 && 
                    <div>We have already received your payment. No additional payment necessary -- you will receive a confirmation email shortly about your update.</div> }
            </div>
        </div>;

    }
}
export default Payment;