import * as React from 'react';
import * as ReactDOM from 'react-dom';
import scriptLoader from 'react-async-script-loader';
import Loading from "src/common/Loading/Loading";
import { IPaypalProps, IPaypalState } from '../interfaces';
declare var ENDPOINT_URL: string;
/*
 * not used currently.
 */

class Paypal extends React.Component<IPaypalProps, IPaypalState> {
    constructor(props:any) {
        super(props);
    }

    payment(data, actions) {
        if (!this.props.formId || !this.props.responseId) {
            throw "An error occurred, formId or responseId do not exist. Please try again.";
        }
        // Set up the payment here, when the buyer clicks on the button
        return actions.payment.create({
            payment: {
                transactions: [
                    {
                        amount: { total: this.props.paymentInfo.total,
                            currency: this.props.paymentInfo.currency },
                        custom: this.props.formId + "/" + this.props.responseId,
                        // todo: fix this.
                        notify_url: ENDPOINT_URL + "?action=ipn"
                    }
                ]
            }
        });
    }
    onAuthorize(data, actions) {
        // Call your server to execute the payment
        console.log('on authorize', data);
        /*
            intent
            :
            "sale"
            payerID
            :
            "JPASXUT2EQNXG"
            paymentID
            :
            "PAY-05425127NY099454ALI6C25I"
            paymentToken
            :
            "EC-1T341231Y05746040"
            returnUrl
            :
            "https://www.sandbox.paypal.com/?paymentId=PAY-05425127NY099454ALI6C25I&token=EC-1T341231Y05746040&PayerID=JPASXUT2EQNXG"

        */
        if (data.error === 'INSTRUMENT_DECLINED') {
            actions.restart();
        }
        return actions.payment.execute().then((payment) => {
            console.log("Done!", payment);
            this.props.onPaymentComplete(payment);
            // The payment is complete!
            // You can now show a confirmation message to the customer
        }).catch((e) => {
            console.log("Error", e);
            this.props.onPaymentError(e);
        });
    };
    onCancel(data, actions) {
        /* 
            * Buyer cancelled the payment 
            */
    }
    
    onError(err) {
        this.props.onPaymentError(err);
        /* 
            * An error occurred during the transaction 
            */
    }
    onClick() {

    }

 render() {
    if (this.props.isScriptLoaded && this.props.isScriptLoadSucceed) {
        let PayPalButton = (window as any).paypal.Button.driver('react', { React, ReactDOM });

        let client = this.props.paymentMethodInfo.client;
        let env = this.props.paymentMethodInfo.env || "sandbox";
        
        return (
            <PayPalButton
            env={env}
            client={client}
            commit={true}
            payment={(a,b) => this.payment(a,b)}
            onAuthorize={(a,b) => this.onAuthorize(a,b)}
            onCancel={(a,b) => this.onCancel(a,b)}
            onError={(a) => this.onError(a)}
            onClick={() => this.onClick()} />
        );
    }
    else if (this.props.isScriptLoaded && !this.props.isScriptLoadSucceed) {
        return (
            <div style={{"color": "red", "fontWeight": "bold"}}>
                Sorry! PayPal is unavailable at this time. Please contact the event organizers to report this issue.
            </div>
        )
    }
    else {
        return (
            <Loading />
        )
    }
 }
    componentDidMount() {
        //return;
    }
}
export default scriptLoader(["https://www.paypalobjects.com/api/checkout.js"])(Paypal);