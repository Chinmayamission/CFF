/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import Payment from './confirmation/payment';
import {flatten} from 'flat';
import {get, cloneDeep} from "lodash-es";
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
        /*let flattenedData = flatten(this.props.data);
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
        console.log("table data is ", tableData, tableHeaders);*/

        /*this.state = {

        };*/

        let paymentInfo_owed : any = cloneDeep(props.paymentInfo);
        if (this.props.paymentInfo_received) {
            paymentInfo_owed.total = parseFloat(this.props.paymentInfo.total) - parseFloat(this.props.paymentInfo_received.total);
            // Just make it one item for now.
            paymentInfo_owed.items[0].amount = paymentInfo_owed.total;
            paymentInfo_owed.items[0].quantity = 1;
            paymentInfo_owed.items[0].description = "Extra amount owed on update";
            paymentInfo_owed.items = [paymentInfo_owed.items[0]];
        }
        console.log(paymentInfo_owed);
        this.state = {
          paymentInfo_owed: paymentInfo_owed,
          "paid": false,
          "paymentTransactionInfo": "",
          tableData,
          tableHeaders
        };
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
    onPaymentStarted(message) {
        this.props.onPaymentStarted(message);
    }
    render() {
        return (
        <div className="ccmt-cff-Page-FormConfirmationPage">        
        <Payment
            onPaymentStarted={e => this.onPaymentStarted(e)}
            apiEndpoint={this.props.apiEndpoint}
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
        )
    }
}

export default FormConfirmationPage;