import React from "react";
import ReactJson from "react-json-view";
import { connect } from "react-redux";
import ReactTable from "react-table";
// import { editResponse } from "src/store/responses/actions";
import { ResponsesState } from "../../../store/responses/types";
import "./PaymentHistory.scss";
import { onPaymentStatusDetailChange } from "../../../store/responses/actions";

interface IValueEditProps extends ResponsesState {
    onChange: (a, b) => void
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
                Footer: <div><button className="btn btn-sm btn-primary">Add</button></div>
            }
        ];
        let data = this.props.responseData.payment_status_detail || [{ "currency": "USD", "amount": "123.00", "date": { "$date": "2018-07-04T15:19:38.697Z" }, "method": "paypal_ipn", "_cls": "chalicelib.models.PaymentStatusDetailItem" }, { "currency": "USD", "amount": "223.00", "date": { "$date": "2018-07-04T16:28:52.857Z" }, "method": "paypal_ipn", "_cls": "chalicelib.models.PaymentStatusDetailItem" }];
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
    onChange: (a, b) => dispatch(onPaymentStatusDetailChange(a, b))
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentHistory);