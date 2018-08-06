import React from "react";
import ReactJson from "react-json-view";
import { connect } from "react-redux";
import ReactTable from "react-table";
// import { editResponse } from "src/store/responses/actions";
import { ResponsesState } from "../../../store/responses/types";
import "./PaymentHistory.scss";

interface IValueEditProps extends ResponsesState {

}
class PaymentHistory extends React.Component<IValueEditProps, {}> {
    render() {
        let headers = [
            {
                Header: "Amount",
                accessor: "amount",
                Footer: <div><input className="form-control form-control-sm" placeholder="Amount" /></div>
            },
            {
                Header: "Date",
                accessor: "date.$date",
                Footer: <div><input className="form-control form-control-sm" placeholder="Date" /></div>
            },
            {
                Header: "Method",
                accessor: "method",
                Footer: <div><select defaultValue="" className="form-control form-control-sm">
                    <option value="" disabled>Method</option>
                    <option value="manual_credit_card">Check</option>
                    <option value="manual_credit_card">Cash</option>
                    <option value="manual_credit_card">Credit Card</option>
                </select></div>
            },
            {
                Header: "ID",
                accessor: "id",
                Footer: <div><input className="form-control form-control-sm" placeholder="ID" /></div>
            },
            {
                Header: "Submit",
                id: "submit",
                accessor: e=>null,
                // Footer: <div><button className="btn btn-sm btn-primary">Add</button></div>
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
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentHistory);