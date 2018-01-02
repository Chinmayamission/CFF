/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import Payment from './components/payment';

var This;
class FormConfirmationPage extends React.Component<IFormConfirmationPageProps, IFormConfirmationPageState> {
    constructor(props:any) {
        super(props);
        This = this;
        this.state = {
            "paid": false,
            "paymentTransactionInfo": "",
        }
    }
    onPaymentComplete(message) {
        /* Called by Payment's thing. */
        This.setState({
            "paid": true,
            "paymentTransactionInfo": JSON.stringify(message, null, 2),
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
            <table className="table table-striped"><tbody>
            <tr key={this.props.responseId["$oid"]}><th>Response ID</th><td>{this.props.responseId["$oid"]}</td></tr>
            {Object.keys(this.props.data).map((item, index) => (
            <tr key={index}>
                <th>{item}</th>
                <td>{this.props.data[item]}</td>
            </tr>
            ))}
            </tbody></table>
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
            onPaymentError={this.onPaymentError}/>
        }
        }
        </div>
        )
    }
}

export default FormConfirmationPage;