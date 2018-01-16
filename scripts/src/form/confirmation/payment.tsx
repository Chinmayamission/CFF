/// <reference path="../interfaces.d.ts"/>
import * as React from 'react';
import Paypal from "./paypal";
import PaypalClassic from "./PaypalClassic";
import CCAvenue from "./CCAvenue";
import {clone} from "lodash-es";
import ReactTable from 'react-table';

let Components = {
    "paypal_rest": Paypal,
    "paypal_classic": PaypalClassic,
    "ccavenue": CCAvenue
};
class Payment extends React.Component<IPaymentProps, any> {
    constructor(props: any) {
        super(props);
        let paymentInfo_owed : any = clone(props.paymentInfo);
        if (this.props.paymentInfo_received) {
            paymentInfo_owed.total = parseFloat(this.props.paymentInfo.total) - parseFloat(this.props.paymentInfo_received.total);
        }
        this.state = {
          paymentInfo_owed: paymentInfo_owed
        };
      }

    getPaymentMethods() {
        let paymentMethods = Object.keys(this.props.paymentMethods);
        return paymentMethods.map((paymentMethod) => {
            var MyComponent = Components[paymentMethod];
            if (!MyComponent) return;
            console.log('option is', paymentMethod);
            let props = {
                "paymentInfo": this.state.paymentInfo_owed,
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
        if (currency == "USD") {
            return "$" + Math.abs(total);
        }
        else {
            return currency + " " + Math.abs(total);
        }
    }
    formatPaymentInfo(paymentInfo : IPaymentInfo) {
        return this.formatPayment(paymentInfo.total, paymentInfo.currency);
    }
    render() {
        if (!this.props.paymentMethods) {
            return "";
        }
        let tableHeaders = [
            {
                Header: "Name",
                accessor: "name"
            },
            {
                Header: "Description",
                accessor: "description"
            },
            {
                Header: "Amount",
                id: "amount",
                accessor: d=>this.formatPayment(d.amount)
            },
            {
                Header: "Quantity",
                accessor: "quantity"
            }
        ];
        let tableData = this.props.paymentInfo.items;
        return <div><br />
            <h1>Pay Now</h1>
            <div>
            {this.props.paymentInfo &&
                <div className="mb-2">
                    <ReactTable columns={tableHeaders} data={tableData}
                        minRows={0}
                        showPagination={false}
                        className="my-4" />
                    Total Amount: {this.formatPaymentInfo(this.props.paymentInfo)}
                </div>
            }
            {this.props.paymentInfo_received && 
                <div>
                    <div>Amount Already Paid: {this.formatPaymentInfo(this.props.paymentInfo_received)}</div>
                </div>
            }
            {this.state.paymentInfo_owed.total > 0 &&
                <div><b>Amount Owed: {this.formatPaymentInfo(this.state.paymentInfo_owed)} </b></div>
            }
            {this.state.paymentInfo_owed.total < 0 &&
                <div>
                    <b>Amount Overpaid: {this.formatPaymentInfo(this.state.paymentInfo_owed)} </b>
                    <p>Please contact us if you would like a refund, or otherwise, this money will serve as a donation.</p>
                </div>
            }
            </div>
            <div style={{ "textAlign": "center" }}>
                {this.state.paymentInfo_owed.total > 0 && 
                    <div>
                        <p>Please select a payment method to complete the form. You will receive a confirmation email after the payment is complete.</p><br />
                        {this.getPaymentMethods()}
                    </div>
                }
                {this.state.paymentInfo_owed.total == 0 && 
                    <div>We have already received your payment. No additional payment necessary -- you will receive a confirmation email shortly about your update.</div> }
            </div>
        </div>;

    }
}
export default Payment;