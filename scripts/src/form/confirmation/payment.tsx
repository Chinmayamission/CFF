/// <reference path="../interfaces.d.ts"/>
import * as React from 'react';
import PaymentTable from "./PaymentTable";
import Paypal from "./paypal";
import PaypalClassic from "./PaypalClassic";
import CCAvenue from "./CCAvenue";
import ManualApproval from "./ManualApproval";
import {clone} from "lodash-es";
import ReactTable from 'react-table';
import * as DOMPurify from 'dompurify';
import ExpressionParser from "src/common/ExpressionParser";

let Components = {
    "paypal_rest": Paypal,
    "paypal_classic": PaypalClassic,
    "ccavenue": CCAvenue,
    "manual_approval": ManualApproval,
    "manual_approval_2": ManualApproval
};
class Payment extends React.Component<IPaymentProps, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            paymentStarted: false,
            paymentMethodStarted: null
        }
      }

    getPaymentMethods() {
        let paymentMethods = Object.keys(this.props.paymentMethods);
        return paymentMethods.map((paymentMethod) => {
            var MyComponent = Components[paymentMethod];
            if (!MyComponent) return;
            
            // Hide other payment method buttons when one payment method has started:
            if (this.state.paymentMethodStarted && this.state.paymentMethodStarted != paymentMethod) return;

            let props = {
                "onPaymentStarted": e => this.onPaymentStarted(paymentMethod, e),
                "paymentStarted": this.state.paymentStarted,
                "paymentInfo_owed": this.props.paymentInfo_owed,
                "paymentInfo_received": this.props.paymentInfo_received,
                "paymentInfo": this.props.paymentInfo,
                "paymentMethodInfo": this.props.paymentMethods[paymentMethod],
                "onPaymentComplete": this.props.onPaymentComplete,
                "onPaymentError": this.props.onPaymentError,
                "responseId": this.props.responseId,
                "formId": this.props.formId,
                "formData": this.props.formData,
                "paymentMethodName": paymentMethod
                // todo: get user's entered data.
            }

            // Hide payment method if it should be hidden according to cff_show_when
            if (props.paymentMethodInfo.cff_show_when &&
                    !ExpressionParser.calculate_price(props.paymentMethodInfo.cff_show_when, props.formData)) {
                        return;
                    }
            return (<div className="col-12 col-sm-6 col-md-4 p-4" style={{"margin": "0 auto"}}>
                    <MyComponent key={paymentMethod} {...props} />
                    </div>);
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
    onPaymentStarted(paymentMethodName, e) {
        this.props.onPaymentStarted(e);
        this.setState({paymentStarted: true, paymentMethodStarted: paymentMethodName});
    }
    render() {
        if (!this.props.paymentMethods) {
            return "";
        }
        return <div><br />
            <h1>{this.props.paymentInfo.paymentInfoTableTitle || "Payment"}</h1>
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
                    <div className="container-fluid row">
                        {!this.state.paymentStarted && 
                            <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(this.props.paymentInfo.description || "Please select a payment method to complete the form. You will receive a confirmation email after the payment is complete.") }} />
                        }
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