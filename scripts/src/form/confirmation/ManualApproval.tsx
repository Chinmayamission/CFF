/// <reference path="../interfaces.d.ts"/>
import * as React from 'react';
import {API} from "aws-amplify";
import * as DOMPurify from 'dompurify';

class ManualApproval extends React.Component<any, any> {
 constructor(props) {
     super(props);
     this.state = {
         done: false
     }
 }
 sendConfirmationEmail() {
    API.post("CFF", `forms/${this.props.formId}/responses/${this.props.responseId}/sendConfirmationEmail`, {
        "body": {"paymentMethod": "manual_approval"}
    }).then(e => {
        this.setState({"done": true});
        this.props.onPaymentStarted();
    }).catch(e => {
        alert("Error " + e);
        console.log(e);
    })
 }
 render() {
     let ccAvenueInfo = {

     };
     return (<div>
         {this.state.done &&
         <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(this.props.paymentInfo.successMessage || "Your response has been submitted. You will receive a confirmation email with information about how to pay soon.") }} />
         }
         {!this.state.done &&
         <input type="submit" className="btn btn-primary" onClick={e => this.sendConfirmationEmail()} value={this.props.paymentMethodInfo.payButtonText || "Continue with Payment"} />
         }
        </div>);
 }

}

export default ManualApproval;