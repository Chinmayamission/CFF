import * as React from "react";
import Payment from "./confirmation/payment";
import { get, cloneDeep } from "lodash";
import {
  IFormConfirmationPageProps,
  IFormConfirmationPageState,
  IPaymentInfoReceived
} from "./interfaces";

var This;
class FormConfirmationPage extends React.Component<
  IFormConfirmationPageProps,
  IFormConfirmationPageState
> {
  constructor(props: any) {
    super(props);
    This = this;
    console.log("Data is ", this.props.data);
    let tableHeaders = [
      {
        Header: "Field",
        accessor: "field"
      },
      {
        Header: "Value",
        accessor: "value"
      }
    ];

    let tableData = [];

    let paymentInfo_owed: IPaymentInfoReceived = {
      total: props.paymentInfo.total,
      currency: props.paymentInfo.currency
    };
    // todo: fix this?
    if (props.paymentInfo_received && props.paymentInfo.items.length) {
      paymentInfo_owed.total =
        parseFloat(this.props.paymentInfo.total) -
        this.props.paymentInfo_received.total;
    }
    console.log(paymentInfo_owed);
    this.state = {
      paymentInfo_owed: paymentInfo_owed,
      paid: false,
      paymentTransactionInfo: "",
      tableData,
      tableHeaders
    };
  }
  onPaymentComplete(message) {
    /* Called by Payment's thing. */
    This.setState({
      paid: true,
      paymentTransactionInfo: JSON.stringify(message, null, 2)
    });
  }
  onPaymentError(message) {
    alert("There was an error. " + message);
    console.log("error", message);
  }
  onPaymentStarted(message) {
    this.props.onPaymentStarted(message);
  }
  render() {
    return (
      <div className="ccmt-cff-Page-FormConfirmationPage">
        <Payment
          onPaymentStarted={e => this.onPaymentStarted(e)}
          paymentInfo={this.props.paymentInfo}
          paymentInfo_owed={this.state.paymentInfo_owed}
          paymentInfo_received={this.props.paymentInfo_received}
          paymentMethods={this.props.paymentMethods}
          onPaymentComplete={this.props.onPaymentComplete}
          onPaymentError={this.onPaymentError}
          responseId={this.props.responseId}
          formId={this.props.formId}
          formData={this.props.data}
        />
      </div>
    );
  }
}

export default FormConfirmationPage;
