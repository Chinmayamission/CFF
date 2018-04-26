/// <reference path="../interfaces.d.ts"/>
/// <reference path="./IPaymentCalcTable.d.ts"/>
import * as React from 'react';
import ReactTable from 'react-table';
import PaymentTable from "src/form/confirmation/PaymentTable";
import ExpressionParser from "src/common/util/ExpressionParser";
import {cloneDeep} from "lodash-es";
import {Parser} from 'expr-eval';

class PaymentCalcTable extends React.Component<IPaymentCalcTableProps, IPaymentCalcTableState> {
    constructor(props: any) {
        super(props);
        this.state = {
            paymentInfo: null
        }
    }
    calculatePaymentInfo(paymentCalcInfo, formData) {
        let paymentInfoItemsWithTotal = [];
        let paymentInfo = cloneDeep(paymentCalcInfo);
        paymentInfo['total'] = 0;
        for (let paymentInfoItem of paymentInfo.items) {
            if (~paymentInfoItem.amount.indexOf("total") || ~paymentInfoItem.quantity.indexOf("total")) {
                paymentInfoItemsWithTotal.push(paymentInfoItem);
                continue;
            }
            paymentInfoItem.amount = ExpressionParser.calculate_price(paymentInfoItem.amount, formData);
            paymentInfoItem.quantity = ExpressionParser.calculate_price(paymentInfoItem.quantity, formData);
            paymentInfo['total'] += paymentInfoItem['amount'] * paymentInfoItem['quantity'];
        }
        // Now take care of items for coupon code, round off, etc. -- which need the total value to work.
        formData['total'] = paymentInfo['total']
        for (let paymentInfoItem of paymentInfoItemsWithTotal) {
            paymentInfoItem.amount = ExpressionParser.calculate_price(paymentInfoItem.amount, formData);
            paymentInfoItem.quantity = ExpressionParser.calculate_price(paymentInfoItem.quantity, formData);
            paymentInfo['total'] += paymentInfoItem['amount'] * paymentInfoItem['quantity'];
        }
        delete formData['total'];
        paymentInfo.items = paymentInfo.items.filter(e => e.amount && e.quantity);
        return paymentInfo;
    }
    render() {
        let paymentInfo = this.calculatePaymentInfo(this.props.paymentCalcInfo, this.props.formData);
        if (!paymentInfo.items.length) return null;
        return (
            <PaymentTable paymentInfo={paymentInfo} />
        );
    }
}
export default PaymentCalcTable;