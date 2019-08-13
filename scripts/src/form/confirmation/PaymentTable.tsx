import * as React from "react";
import ReactTable from "react-table";
import RRule from "rrule";
import nunjucks from "nunjucks";
import { IPaymentTableProps } from "./PaymentTable.d";
import { IPaymentInfo } from "../interfaces";
import sanitize from "../../sanitize";

nunjucks.installJinjaCompat();

const processCurrency = (paymentInfo, formData) => {
  if (paymentInfo.currencyTemplate) {
    let currency = sanitize(
      nunjucks.renderString(paymentInfo.currencyTemplate, {
        value: formData || {}
      })
    );
    return { ...paymentInfo, currency };
  }
  return paymentInfo;
};

function formatRecurrence({ recurrenceDuration, recurrenceTimes }) {
  if (!recurrenceDuration) {
    return "";
  }
  let [expr, time, units] = /(\d*)([DWMY])/.exec(recurrenceDuration);
  let rrule = new RRule({
    freq: {
      D: RRule.DAILY,
      W: RRule.WEEKLY,
      M: RRule.MONTHLY,
      Y: RRule.YEARLY
    }[units],
    interval: parseInt(time),
    count: recurrenceTimes // Will be undefined if not specified, thus allowing for an indefinite count.
  });
  return rrule.toText();
}

const numericColStyle = { textAlign: "right" };

class PaymentTable extends React.Component<IPaymentTableProps, any> {
  constructor(props: any) {
    super(props);
  }

  formatPayment(total, currency = "USD") {
    if (!total) {
      return "";
    }
    if (Intl && Intl.NumberFormat) {
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency
      }).format(total);
    } else {
      return total + " " + currency;
    }
  }
  formatPaymentInfo(paymentInfo: IPaymentInfo) {
    return this.formatPayment(paymentInfo.total, paymentInfo.currency);
  }
  render() {
    let tableHeaders = [
      {
        Header: "Name",
        accessor: "name"
      },
      {
        Header: "Description",
        accessor: "description"
      },
      {
        Header: "Amount",
        id: "amount",
        style: numericColStyle,
        accessor: d =>
          this.formatPayment(d.amount, this.props.paymentInfo.currency)
      },
      {
        Header: "Quantity",
        id: "quantity",
        style: numericColStyle,
        accessor: d =>
          d.recurrenceDuration
            ? formatRecurrence(d)
              ? " " + formatRecurrence(d)
              : ""
            : d.quantity
      },
      {
        Header: "Total",
        id: "total",
        style: numericColStyle,
        accessor: d =>
          d.installment
            ? ""
            : this.formatPayment(d.total, this.props.paymentInfo.currency)
      }
    ];
    let tableData = this.props.paymentInfo.items;
    return (
      <div>
        {this.props.paymentInfo && (
          <div className="mb-2">
            <ReactTable
              columns={tableHeaders}
              data={tableData}
              minRows={0}
              showPagination={false}
              className="my-4"
            />
            Total Amount:{" "}
            {this.formatPaymentInfo(
              processCurrency(this.props.paymentInfo, this.props.formData)
            )}
          </div>
        )}
      </div>
    );
  }
}
export default PaymentTable;
