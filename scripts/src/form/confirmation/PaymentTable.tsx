/// <reference path="../interfaces.d.ts"/>
/// <reference path="./PaymentTable.d.ts"/>
import * as React from 'react';
import ReactTable from 'react-table';

class PaymentTable extends React.Component<IPaymentTableProps, any> {
    constructor(props: any) {
        super(props);
    }

    formatPayment(total, currency = "USD") {
        let formatTxt = "";
        total = Math.round(100*total)/100;
        if (currency == "USD") {
            formatTxt = "$" + Math.abs(total);
        }
        else {
            formatTxt = currency + " " + Math.abs(total);
        }
        if (total > 0) {
            return formatTxt;
        }
        else {
            return <div>-{formatTxt}</div>;
        }
    }
    formatPaymentInfo(paymentInfo: IPaymentInfo) {
        return this.formatPayment(paymentInfo.total, paymentInfo.currency);
    }
    render() {
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
                accessor: d => this.formatPayment(d.amount)
            },
            {
                Header: "Quantity",
                accessor: "quantity"
            }
        ];
        let tableData = this.props.paymentInfo.items;
        return (
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
            </div>
        );
    }
}
export default PaymentTable;