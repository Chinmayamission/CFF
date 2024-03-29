import * as React from "react";
import PaymentTable from "./PaymentTable";
import PaypalClassic from "./PaypalClassic";
import CCAvenue from "./CCAvenue";
import ManualApproval from "./ManualApproval";
import Redirect from "./Redirect";
import Text from "./Text";
import sanitize from "../../sanitize";
import ExpressionParser from "../../common/ExpressionParser";
import { IPaymentProps, IPaymentInfo } from "../interfaces";

let Components = {
  paypal_classic: PaypalClassic,
  ccavenue: CCAvenue,
  manual_approval: ManualApproval,
  manual_approval_2: ManualApproval,
  redirect: Redirect,
  text: Text
};

// Payment methods that are always shown, even if the user has fully paid.
const PAYMENT_METHODS_ALWAYS_SHOWN = ["redirect", "text"];

class Payment extends React.Component<IPaymentProps, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      paymentStarted: false,
      paymentMethodStarted: null
    };
  }

  getPaymentMethods(fullyPaid) {
    let paymentMethods = Object.keys(this.props.paymentMethods);
    return paymentMethods.map(paymentMethod => {
      // If fullyPaid is true, only gets payment methods that apply regardless of whether
      // one has fully paid (in this case, the "redirect" payment method).
      if (
        fullyPaid &&
        PAYMENT_METHODS_ALWAYS_SHOWN.indexOf(paymentMethod) === -1
      )
        return;

      var MyComponent = Components[paymentMethod];
      if (!MyComponent) return;

      // Hide other payment method buttons when one payment method has started:
      if (
        this.state.paymentMethodStarted &&
        this.state.paymentMethodStarted != paymentMethod
      )
        return;

      let props = {
        onPaymentStarted: e => this.onPaymentStarted(paymentMethod, e),
        paymentStarted: this.state.paymentStarted,
        paymentInfo_owed: this.props.paymentInfo_owed,
        paymentInfo_received: this.props.paymentInfo_received,
        paymentInfo: this.props.paymentInfo,
        paymentMethodInfo: this.props.paymentMethods[paymentMethod],
        onPaymentComplete: this.props.onPaymentComplete,
        onPaymentError: this.props.onPaymentError,
        responseId: this.props.responseId,
        formId: this.props.formId,
        formData: this.props.formData,
        responseMetadata: this.props.responseMetadata,
        paymentMethodName: paymentMethod
        // todo: get user's entered data.
      };

      // Hide payment method if it should be hidden according to cff_show_when
      if (
        props.paymentMethodInfo.cff_show_when &&
        !ExpressionParser.calculate_price(
          props.paymentMethodInfo.cff_show_when,
          props.formData,
          true,
          props.responseMetadata
        )
      ) {
        return;
      }
      return (
        <div className="col-12 col-sm-6 p-4" style={{ margin: "0 auto" }}>
          <MyComponent key={paymentMethod} {...props} />
        </div>
      );
    });
  }
  formatPayment(total, currency = "USD") {
    if (Intl && Intl.NumberFormat) {
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency
      }).format(total);
    } else {
      return total + " " + currency;
    }
  }
  formatPaymentInfo(paymentInfo: IPaymentInfo) {
    return this.formatPayment(paymentInfo.total, paymentInfo.currency);
  }
  onPaymentStarted(paymentMethodName, e) {
    this.props.onPaymentStarted(e);
    this.setState({
      paymentStarted: true,
      paymentMethodStarted: paymentMethodName
    });
  }
  render() {
    if (!this.props.paymentMethods) {
      return "";
    }
    if (
      (!this.props.paymentInfo_owed ||
        this.props.paymentInfo_owed.total === 0) &&
      (!this.props.paymentInfo ||
        !this.props.paymentInfo.items ||
        this.props.paymentInfo.items.length === 0) &&
      (!this.props.paymentInfo_received ||
        this.props.paymentInfo_owed.total === 0)
    ) {
      // No payment involved, so just render manual payment buttons.
      return <>{this.getPaymentMethods(true)}</>;
    }
    return (
      <div>
        <h1 className="text-center my-2 p-4">
          {this.props.paymentInfo.paymentInfoTableTitle || "Payment"}
        </h1>
        <div>
          {this.props.paymentInfo &&
            this.props.paymentInfo.items &&
            this.props.paymentInfo.items.length > 0 && (
              <PaymentTable
                paymentInfo={this.props.paymentInfo}
                formData={this.props.formData}
              />
            )}
          {this.props.paymentInfo_received &&
            this.props.paymentInfo_received.total > 0 && (
              <div>
                {this.props.paymentInfo_received && (
                  <div>
                    <div>
                      Amount Already Paid:{" "}
                      {this.formatPaymentInfo(this.props.paymentInfo_received)}
                    </div>
                  </div>
                )}
                {this.props.paymentInfo_owed.total > 0 && (
                  <div>
                    <b>
                      Amount Owed:{" "}
                      {this.formatPaymentInfo(this.props.paymentInfo_owed)}{" "}
                    </b>
                  </div>
                )}
                {this.props.paymentInfo_owed.total < 0 && (
                  <div>
                    <b>
                      Amount Overpaid:{" "}
                      {this.formatPaymentInfo(this.props.paymentInfo_owed)}{" "}
                    </b>
                    <p>
                      Please contact us if you would like a refund, or,
                      otherwise, this money will serve as a donation.
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>
        <div>
          {this.props.paymentInfo_owed.total > 0 && (
            <div
              className="container-fluid row"
              style={{ textAlign: "center" }}
            >
              {!this.state.paymentStarted && (
                <div
                  className="col-12"
                  dangerouslySetInnerHTML={{
                    __html: sanitize(
                      this.props.paymentInfo.description ||
                        "Please select a payment method to complete the form. You will receive a confirmation email after the payment is complete."
                    )
                  }}
                />
              )}
              {this.getPaymentMethods(false)}
            </div>
          )}
          {this.props.paymentInfo_owed.total === 0 && (
            <>
              <div className="alert alert-info">
                We have already received your payment. No additional payment
                necessary -- you will receive a confirmation email shortly about
                your update.
              </div>
              {this.getPaymentMethods(true)}
            </>
          )}
        </div>
      </div>
    );
  }
}
export default Payment;
