import * as React from 'react';
import {API} from "aws-amplify";
import * as DOMPurify from 'dompurify';
import Loading from "../../common/Loading/Loading";

class ManualApproval extends React.Component<any, any> {
 constructor(props) {
     super(props);
     this.state = {
         done: false,
         loading: false
     }
 }
 sendConfirmationEmail() {
    this.setState({"loading": true});
    API.post("CFF", `responses/${this.props.responseId}/sendConfirmationEmail`, {
        "body": {"paymentMethod": this.props.paymentMethodName}
    }).then(e => {
        this.setState({"done": true, "loading": false});
        this.props.onPaymentStarted();
    }).catch(e => {
        alert("Error " + e);
        console.log(e);
        this.setState({"loading": false});
    })
 }
 render() {
     let ccAvenueInfo = {

     };
     return (<div>
         {this.state.loading && 
            <Loading />}
         {this.state.done &&
         <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(this.props.paymentMethodInfo.successMessage || "Your response has been submitted. You will receive a confirmation email with information about how to pay soon.") }} />
         }
         {!this.state.done &&
         <input type="submit" className="btn btn-primary" onClick={e => this.sendConfirmationEmail()} value={this.props.paymentMethodInfo.payButtonText || "Continue with Payment"} />
         }
        </div>);
 }

}

export default ManualApproval;