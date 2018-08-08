import React from "react";
import { connect } from "react-redux";
import ReactTable from "react-table";
import { ResponsesState } from "../../../store/responses/types";
import "./PaymentHistory.scss";
import { onPaymentStatusDetailChange, submitNewPayment } from "../../../store/responses/actions";

interface IValueEditProps extends ResponsesState {
    onChange: (a, b) => void,
    submitNewPayment: () => void
}
class PaymentHistory extends React.Component<IValueEditProps, {}> {
    formatPayment(total, currency = "USD") {
        if (Intl && Intl.NumberFormat) {
            return Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(total);
        }
        else {
            return total + " " + currency;
        }
    }
    submitNewPayment() {
        const item = this.props.paymentStatusDetailItem;
        if (item.amount && item.id && item.method) {
            return this.props.submitNewPayment();
        }
        else {
            alert("Please fill out all fields before submitting.");
        }
    }
    render() {
        let headers = [
            {
                Header: "Amount",
                id: "amount",
                accessor: e => this.formatPayment(e.amount, e.currency),
                Footer: <div>
                    <input value={this.props.paymentStatusDetailItem.amount}
                        onChange={e => this.props.onChange("amount", e.target.value)}
                        className="form-control form-control-sm" placeholder="Amount" />
                </div>
            },
            {
                Header: "Method",
                accessor: "method",
                Footer: <div><select
                    value={this.props.paymentStatusDetailItem.method}
                    onChange={e => this.props.onChange("method", e.target.value)}
                    className="form-control form-control-sm">
                    <option value="" disabled>Method</option>
                    <option value="manual_check">Check</option>
                    <option value="manual_cash">Cash</option>
                    <option value="manual_credit_card">Credit Card</option>
                </select></div>
            },
            {
                Header: "ID",
                accessor: "id",
                Footer: <div><input
                    value={this.props.paymentStatusDetailItem.id}
                    onChange={e => this.props.onChange("id", e.target.value)}
                    className="form-control form-control-sm" placeholder="ID" /></div>
            },
            {
                Header: "Date",
                accessor: "date.$date",
                Footer: <div></div>
            },
            {
                Header: "Submit",
                id: "submit",
                accessor: e => null,
                Footer: <div><button className="btn btn-sm btn-primary cff-payment-history-btn-add" onClick={e => this.submitNewPayment()} >Add</button></div>
            }
        ];
        let data = this.props.responseData.payment_status_detail;
        if (!data) { return <div>No payments yet.</div> };
        return <div className="cff-response-payment-history">
            <ReactTable data={data} columns={headers} minRows={0} showPagination={data.length > 5} />
        </div>;
    }
}

const mapStateToProps = state => ({
    ...state.responses
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onChange: (a, b) => dispatch(onPaymentStatusDetailChange(a, b)),
    submitNewPayment: () => dispatch(submitNewPayment())
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentHistory);