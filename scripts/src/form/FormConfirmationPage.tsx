/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import Payment from './components/payment';
import {flatten} from 'flat';
import ReactTable from 'react-table';

var This;
class FormConfirmationPage extends React.Component<IFormConfirmationPageProps, IFormConfirmationPageState> {
    constructor(props:any) {
        super(props);
        This = this;
        let tableHeaders = [
            {
                Header: "Field",
                accessor: "field"
                //id: "field",
                //accessor: d => d.field
            },
            {
                Header: "Value",
                accessor: "value"
            }
        ];
        /*for (let header in this.props.data) {
            if (!~headers.indexOf(header)) {
                headers.push(header);
                headerObjs.push({
                    Header: header,
                    id: header,
                    accessor: d=> JSON.stringify(d[header]) // String-based value accessors!
                  });
            }
        }*/
        let tableData = [];
        let flattenedData = flatten(this.props.data);
        for (let field in flattenedData) {
            tableData.push({
                "field": field,
                "value": flattenedData[field]
            })
        };

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
            {!this.state.paid && <button className="btn btn-primary"
                onClick={this.props.goBack}
            >Back to form page</button>}
            {/*<table className="table table-striped"><tbody>
            <tr key={this.props.responseId}><th>Response ID</th><td>{this.props.responseId}</td></tr>
            {Object.keys(flatten(this.props.data)).map((item, index) => (
            <tr key={index}>
                <th>{item}</th>
                <td>{this.props.data[item]}</td>
            </tr>
            ))}
            </tbody></table>*/}
            {
                
            }
            <ReactTable
                data={this.state.tableData}
                columns={this.state.tableHeaders}
            />
        {(this.state.paid) ? 
        <div>
            <h1>Thanks for paying!</h1>
            <p>Please print this page for your confirmation.</p>
            <pre>
                {this.state.paymentTransactionInfo}
            </pre>
        </div> :
         <Payment schema={this.props.schema}
            onPaymentComplete={this.onPaymentComplete}
            onPaymentError={this.onPaymentError}
            responseId={this.props.responseId}/>
        }
        }
        </div>
        )
    }
}

export default FormConfirmationPage;