import * as React from 'react';
import { IPaymentMethodProps, ICCAvenueProps } from '../interfaces';

declare var MODE: string;

function CCAvenue(props: ICCAvenueProps) {
    return <form method="post" action={(MODE !== 'prod') ? "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction" : "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"}>
        <input type="hidden" name="encRequest" value={props.paymentMethodInfo.encRequest} />
        <input type="hidden" name="access_code" value={props.paymentMethodInfo.access_code} />
        <input type="submit" className="btn btn-primary" value={props.paymentMethodInfo.payButtonText || "Pay Now with CCAvenue"} />
    </form>
}

export default CCAvenue;