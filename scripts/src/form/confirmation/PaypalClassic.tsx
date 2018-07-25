/// <reference path="../interfaces.d.ts" />
import * as React from 'react';
import {get, sumBy} from "lodash-es";
import {connect} from "react-redux";

/* Example Usage:

  "paymentMethods": {
    "paypal_classic": {
      "sandbox": true,
      "business": "aramaswamis-facilitator@gmail.com",
      "cmd": "_cart",
      "first_name": "$participants[0].name.first",
      "last_name": "$participants[0].name.last",
      "address1": "$address.line1",
      "address2": "$address.line2",
      "city": "$address.city",
      "state": "$address.state",
      "zip": "$address.zip",
      "email": "$email"
    }

 */

const mapStateToProps = state => ({
    ...state.auth
});
  
const mapDispatchToProps = (dispatch, ownProps) => ({

});

declare var MODE: string;
declare var ENDPOINT_URL: string;
class PaypalClassic extends React.Component<IPaypalClassicProps, IPaypalClassicState> {
    constructor(props:IPaypalClassicProps) {
        super(props);
        let items = props.paymentInfo.items.filter(e => e.amount > 0);
        let state = {
            "form_url": (MODE != 'prod') ? "https://www.sandbox.paypal.com/cgi-bin/webscr" : "https://www.paypal.com/cgi-bin/webscr",
            "custom": this.props.responseId,
            "cmd": "_cart",
            "business": this.props.paymentMethodInfo.business,
            "currency_code": this.props.paymentInfo_owed.currency || "USD",
            // todo: Fix this.
            "notify_url": `${ENDPOINT_URL}responses/${this.props.responseId}/ipn`,
            "return": this.props.paymentInfo_owed.redirectUrl || ((window.location != window.parent.location) ? document.referrer : window.location.href),
            "cancel_return": (window.location != window.parent.location) ? document.referrer : window.location.href,
            "items": items,
            "amount": this.props.paymentInfo_owed.total, // not used.
            "image_url": this.props.paymentMethodInfo.image_url,
            "first_name": this.props.paymentMethodInfo.first_name,
            "last_name": this.props.paymentMethodInfo.last_name,
            "address1": this.props.paymentMethodInfo.address1,
            "address2": this.props.paymentMethodInfo.address2,
            "city": this.props.paymentMethodInfo.city,
            "state": this.props.paymentMethodInfo.state,
            "zip": this.props.paymentMethodInfo.zip,
            "night_phone_a": this.props.paymentMethodInfo.night_phone_a,
            "night_phone_b": this.props.paymentMethodInfo.night_phone_b,
            "night_phone_c": this.props.paymentMethodInfo.night_phone_c,
            "email": this.props.paymentMethodInfo.email,
            "payButtonText": this.props.paymentMethodInfo.payButtonText || "Pay Now with Paypal",
            "discount_amount_cart": Math.abs(sumBy(items, e => e.amount < 0 ? e.amount : 0)) +
                (this.props.paymentInfo_received ? this.props.paymentInfo_received.total : 0),
            "recurring_payments": false
        }
        // // Replace $'s with actual values from the data.
        // for (let i in state) {
        //     if (typeof state[i] === 'string' && state[i][0] == "$") {
        //         let key = state[i].substring(1);
        //         state[i] = get(this.props.formData, key) || "";
        //         // console.log(this.props.formData, key, state[i]);
        //     }
        // }
        this.state = state;
    }
    componentDidMount() {
        //return;
    }

    render() {
    return (
        <form action={this.state.form_url} method="post">
            <input type="hidden" name="cmd" value={this.state.cmd}/>
            <input type="hidden" name="custom" value={this.state.custom} />
            <input type="hidden" name="charset" value="utf-8" />
            <input type="hidden" name="upload" value="1" />
            <input type="hidden" name="business" value={this.state.business} />
            <input type="hidden" name="currency_code" value={this.state.currency_code} />
            <input type="hidden" name="notify_url" value={this.state.notify_url} />
            <input type="hidden" name="return" value={this.state.return} />
            <input type="hidden" name="cancel_return" value={this.state.cancel_return} />
            {this.state.items.map((item, i) =>
                <div key={i}>
                    <input type="hidden" name={"item_name_" + (i+1)} value={item.name} />
                    <input type="hidden" name={"item_number_" + (i+1)} value={item.description} />
                    <input type="hidden" name={"quantity_" + (i+1)} value={item.quantity} />
                    <input type="hidden" name={"amount_" + (i+1)} value={item.amount} />
                </div>
            )}
            <input type="hidden" name="discount_amount_cart" value={this.state.discount_amount_cart} />
            <input type="hidden" name="image_url" value={this.state.image_url} />
            <input type="hidden" name="first_name" value={this.state.first_name} />
            <input type="hidden" name="last_name" value={this.state.last_name} />
            <input type="hidden" name="address1" value={this.state.address1} />
            <input type="hidden" name="address2" value={this.state.address2} />
            <input type="hidden" name="city" value={this.state.city} />
            <input type="hidden" name="state" value={this.state.state} />
            <input type="hidden" name="zip" value={this.state.zip} />
            <input type="hidden" name="night_phone_a" value={this.state.night_phone_a} />
            <input type="hidden" name="night_phone_b" value={this.state.night_phone_b} />
            <input type="hidden" name="night_phone_c" value={this.state.night_phone_c} />
            <input type="hidden" name="email" value={this.state.email} />
            {/*<input type="image" name="submit"
            src="https://www.paypalobjects.com/en_US/i/btn/btn_buynow_LG.gif"
    alt="PayPal - The safer, easier way to pay online"/>*/}
            <input type="submit" className="btn btn-primary" value={this.state.payButtonText} />
            {/* {this.state.recurring_payments &&
                <div>
                    xclick-subscriptions
                    https://developer.paypal.com/docs/classic/paypal-payments-standard/integration-guide/Appx_websitestandard_htmlvariables/#recurring-payment-variables
                    t3
                    D. Days. Valid range for p3 is 1 to 90.
                    W. Weeks. Valid range for p3 is 1 to 52.
                    M. Months. Valid range for p3 is 1 to 24.
                    Y. Years. Valid range for p3 is 1 to 5.
                    
                    <input type="hidden" name="a3" value="1" />
                    <input type="hidden" name="p3" value="1" />
                    <input type="hidden" name="t3" value="M" />
                    <input type="hidden" name="no_note" value="1" />
                </div> */}
            }
        </form>
    );
    } 
}
export default connect(mapStateToProps, mapDispatchToProps)(PaypalClassic);