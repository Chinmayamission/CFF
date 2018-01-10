/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import Payment from './components/payment';
import {flatten} from 'flat';
import ReactTable from 'react-table';
import {get} from "lodash-es";
import {queryString} from 'query-string'; 
import SchemaUtil from "src/common/util/SchemaUtil";

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
            let fieldValue : any = flattenedData[fieldPath];
            if (typeof fieldValue == "boolean")
                fieldValue = (fieldValue ? "Yes": "No");
            tableData.push({
                "field": SchemaUtil.readableDotNotation(fieldPath, schemaItem.title),
                "value": fieldValue
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
        <div className="ccmt-cff-Page-FormConfirmationPage">        
        <Payment
            apiEndpoint={this.props.apiEndpoint}
            schemaMetadata={this.props.schemaMetadata}
            onPaymentComplete={this.props.onPaymentComplete}
            onPaymentError={this.onPaymentError}
            responseId={this.props.responseId}/>
        </div>
        )
    }
}

export default FormConfirmationPage;