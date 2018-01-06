/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import Payment from './components/payment';
import {flatten} from 'flat';
import ReactTable from 'react-table';
import {get} from "lodash-es";
import {queryString} from 'query-string'; 
import SchemaUtil from "src/common/util/SchemaUtil.tsx";

var This;
class FormConfirmationPage extends React.Component<IFormConfirmationPageProps, IFormConfirmationPageState> {
    constructor(props:any) {
        super(props);
        This = this;
        console.log("Data is " , this.props.data);
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
        let flattenedData = flatten(this.props.data);
        for (let fieldPath in flattenedData) {
            let schemaItem = get(this.props.schema.properties, SchemaUtil.objToSchemaPath(fieldPath));
            if (!schemaItem) schemaItem = fieldPath;
            tableData.push({
                "field": schemaItem.title || SchemaUtil.getLastDotNotation(fieldPath) || fieldPath,
                "value": flattenedData[fieldPath]
            });
        };
        console.log("table data is ", tableData, tableHeaders);

        this.state = {
            "paid": false,
            "paymentTransactionInfo": "",
            tableData,
            tableHeaders
        }
    }
    onPaymentComplete(message) {
        /* Called by Payment's thing. */
        This.setState({
            "paid": true,
            "paymentTransactionInfo": JSON.stringify(message, null, 2)
        });
    }
    onPaymentError(message) {
        alert("There was an error. " + message);
        console.log("error", message);
    }
    render() {
        return (
        <div className="App FormConfirmationPage">
            <h1>
                {this.props.schema.title} - Confirmation Page
            </h1>
            {!this.state.paid && <button className="button button-primary"
                onClick={this.props.goBack}
            >Back to form page</button>}
            <ReactTable
                data={this.state.tableData}
                columns={this.state.tableHeaders}
                showPagination={false}
                minRows={0}
            />
        {(this.state.paid) ? 
            <div>
                <h1>Payment processing</h1>
                <p>You will receive a confirmation email within 24 hours after the payment has been verified. Please print this page for your verification.</p>
                <pre>
                    {this.state.paymentTransactionInfo}
                </pre>
            </div> :
            <Payment schemaMetadata={this.props.schemaMetadata}
                onPaymentComplete={this.onPaymentComplete}
                onPaymentError={this.onPaymentError}
                responseId={this.props.responseId}/>
        }
        </div>
        )
    }
}

export default FormConfirmationPage;