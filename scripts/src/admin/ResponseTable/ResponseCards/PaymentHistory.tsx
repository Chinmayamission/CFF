import React from "react";
import { connect } from "react-redux";
import ReactTable from "react-table";
import { ResponsesState } from "../../../store/responses/types";
import "./PaymentHistory.scss";
import {
  onPaymentStatusDetailChange,
  submitNewPayment
} from "../../../store/responses/actions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Headers from "../../util/Headers";
import { getPaidStatus } from "../../util/dataOptionUtil";
import { formatPayment } from "../../util/formatPayment";
import CustomForm from "../../../form/CustomForm";
import { FormState } from "../../../store/form/types";

interface IValueEditProps extends ResponsesState {
  onChange: (a, b) => void;
  submitNewPayment: (e: any) => void;
  form: FormState;
}
class PaymentHistory extends React.Component<IValueEditProps, {}> {
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
  submitNewPayment(e) {
    const item = this.props.paymentStatusDetailItem;
    if (item.amount && item.id && item.method) {
      return this.props.submitNewPayment(e);
    } else {
      alert("Please fill out all fields before submitting.");
    }
  }
  render() {
    let headers: any = [
      {
        Header: "Amount",
        id: "amount",
        accessor: e => this.formatPayment(e.amount, e.currency),
        Footer: (
          <div>
            <input
              value={this.props.paymentStatusDetailItem.amount}
              onChange={e => this.props.onChange("amount", e.target.value)}
              className="form-control form-control-sm"
              placeholder="Amount"
            />
          </div>
        )
      },
      {
        Header: "Method",
        accessor: "method",
        Footer: (
          <div>
            <select
              value={this.props.paymentStatusDetailItem.method}
              onChange={e => this.props.onChange("method", e.target.value)}
              className="form-control form-control-sm"
            >
              <option value="" disabled>
                Method
              </option>
              <option value="manual_check">Check</option>
              <option value="manual_cash">Cash</option>
              <option value="manual_credit_card">Credit Card</option>
            </select>
          </div>
        )
      },
      {
        Header: "ID",
        accessor: "id",
        Footer: (
          <div>
            <input
              value={this.props.paymentStatusDetailItem.id}
              onChange={e => this.props.onChange("id", e.target.value)}
              className="form-control form-control-sm"
              placeholder="ID"
            />
          </div>
        )
      },
      {
        Header: "Date",
        accessor: "date.$date",
        Cell: row => Headers.formatValue(row.value),
        Footer: (
          <div>
            <DatePicker
              selected={moment(this.props.paymentStatusDetailItem.date.$date)}
              onChange={e =>
                this.props.onChange("date", { $date: e.toISOString() })
              }
            />
          </div>
        )
      },
      {
        Header: "Notes",
        accessor: "notes",
        Footer: (
          <div>
            <input
              value={this.props.paymentStatusDetailItem.notes}
              onChange={e => this.props.onChange("notes", e.target.value)}
              className="form-control form-control-sm"
              placeholder="Notes"
            />
          </div>
        )
      }
    ];
    const response = this.props.responseData;
    let data = response.payment_status_detail || [];

    let paymentSchemaProperties: any = {
      sendEmail: {
        default: false,
        type: "boolean",
        enumNames: ["Yes", "No"],
        description: "Send confirmation email"
      }
    };
    // TODO: this if statement is a hack to get the tests to work. Remove it.
    if (this.props.form.renderedForm) {
      const confirmationEmailTemplates = this.props.form.renderedForm
        .formOptions.confirmationEmailTemplates;
      if (confirmationEmailTemplates && confirmationEmailTemplates.length) {
        paymentSchemaProperties = {
          ...paymentSchemaProperties,
          emailTemplateId: {
            title: "Email Template",
            default: "",
            enum: ["", ...confirmationEmailTemplates.map(e => e.id)],
            enumNames: [
              "Default",
              ...confirmationEmailTemplates.map(e => e.displayName || e.id)
            ]
          }
        };
      }
    }

    return (
      <div className="cff-response-payment-history">
        Status: <strong>{getPaidStatus(response)}</strong>
        <br />
        Amount Owed:{" "}
        <strong>
          {formatPayment(
            response.paymentInfo.total,
            response.paymentInfo.currency
          )}
        </strong>
        <br />
        Amount Paid:{" "}
        <strong>
          {formatPayment(
            parseFloat(response.amount_paid),
            response.paymentInfo.currency
          )}
        </strong>
        <br />
        <br />
        <ReactTable
          data={data}
          columns={headers}
          minRows={0}
          showPagination={data.length > 5}
        />
        <CustomForm
          schema={{
            type: "object",
            properties: paymentSchemaProperties
          }}
          uiSchema={{
            sendEmail: {}
          }}
          onSubmit={e => this.submitNewPayment(e.formData)}
        >
          <button className="btn btn-sm btn-primary cff-payment-history-btn-add">
            Add new payment
          </button>
        </CustomForm>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ...state.responses,
  form: state.form
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onChange: (a, b) => dispatch(onPaymentStatusDetailChange(a, b)),
  submitNewPayment: e => dispatch(submitNewPayment(e))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentHistory);
