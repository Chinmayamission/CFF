/// <reference path="../interfaces.d.ts" />
import * as React from 'react';
import {get} from "lodash-es";

/* Example Usage:

  "paymentMethods": {
    "paypal_classic": {
      "sandbox": true,
      "business": "aramaswamis-facilitator@gmail.com",
      "cmd": "_cart",
      "item_name": "$title",
      "item_number": "1",
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

class PaypalClassic extends React.Component<IPaypalClassicProps, IPaypalClassicState> {
    constructor(props:any) {
        super(props);
        let state = {
            "form_url": (this.props.paymentMethodInfo.sandbox) ? "https://www.sandbox.paypal.com/cgi-bin/webscr" : "https://www.paypal.com/cgi-bin/webscr",
            "custom": this.props.formId + "/" + this.props.responseId,
            "cmd": "_xclick",
            "business": this.props.paymentMethodInfo.business,
            "currency_code": this.props.paymentInfo.currency || "USD",
            "notify_url": this.props.apiEndpoint + "?action=ipn",
            "return": window.location.href + "#payment_success=1",
            "cancel_return": window.location.href + "#payment_success=0",
            "item_name": this.props.paymentMethodInfo.item_name,
            "item_number": this.props.paymentMethodInfo.item_number,
            "amount": this.props.paymentInfo.total,
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
        }
        for (let i in state) {
            if (typeof state[i] === 'string' && state[i][0] == "$") {
                let key = state[i].substring(1);
                state[i] = get(this.props.formData, key) || "";
                console.log(this.props.formData, key, state[i]);
            }
        }
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
            <input type="hidden" name="business" value={this.state.business} />
            <input type="hidden" name="currency_code" value={this.state.currency_code} />
            <input type="hidden" name="notify_url" value={this.state.notify_url} />
            <input type="hidden" name="return" value={this.state.return} />
            <input type="hidden" name="cancel_return" value={this.state.cancel_return} />
            <input type="hidden" name="item_name" value={this.state.item_name} />
            <input type="hidden" name="item_number" value={this.state.item_number} />
            <input type="hidden" name="amount" value={this.state.amount} />
            <input type="hidden" name="quantity" value="1" />
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
            <input type="submit" className="btn btn-primary" value="Pay Now with PayPal" />
        </form>
    );
    } 
}
export default PaypalClassic;