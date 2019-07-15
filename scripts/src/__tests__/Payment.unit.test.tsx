import React from "react";
import { shallow, mount, render } from "enzyme";
import Payment from "../form/confirmation/payment";
import { calculatePaymentInfo } from "../form/payment/PaymentCalcTable";

it("renders payment table on new response", () => {
  const wrapper = render(
    <Payment
      onPaymentStarted={e => e}
      paymentInfo={{
        currency: "USD",
        total: 12,
        items: [
          {
            name: "One",
            description: "One",
            amount: 12,
            quantity: 1
          }
        ]
      }}
      paymentInfo_owed={{
        currency: "USD",
        total: 0
      }}
      paymentInfo_received={{
        currency: "USD",
        total: 0
      }}
      paymentMethods={[]}
      onPaymentComplete={e => e}
      onPaymentError={e => e}
      responseId={"responseId"}
      formId={"formId"}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("Amount already paid");
});

it("renders payment table with amount received", () => {
  const wrapper = render(
    <Payment
      onPaymentStarted={e => e}
      paymentInfo={{
        currency: "USD",
        total: 12,
        items: [
          {
            name: "One",
            description: "One",
            amount: 12,
            quantity: 1
          }
        ]
      }}
      paymentInfo_owed={{
        currency: "USD",
        total: 7
      }}
      paymentInfo_received={{
        currency: "USD",
        total: 5
      }}
      paymentMethods={[]}
      onPaymentComplete={e => e}
      onPaymentError={e => e}
      responseId={"responseId"}
      formId={"formId"}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("Amount Already Paid: $5.00");
});

it("renders recurring payment table with times", () => {
  const wrapper = render(
    <Payment
      onPaymentStarted={e => e}
      paymentInfo={{
        currency: "USD",
        total: 12,
        items: [
          {
            name: "One",
            description: "One",
            amount: 12,
            quantity: 1,
            recurrenceDuration: "1M"
          }
        ]
      }}
      paymentInfo_owed={{
        currency: "USD",
        total: 0
      }}
      paymentInfo_received={{
        currency: "USD",
        total: 0
      }}
      paymentMethods={[]}
      onPaymentComplete={e => e}
      onPaymentError={e => e}
      responseId={"responseId"}
      formId={"formId"}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("Amount already paid");
});

it("renders recurring payment table with end", () => {
  const wrapper = render(
    <Payment
      onPaymentStarted={e => e}
      paymentInfo={{
        currency: "USD",
        total: 12,
        items: [
          {
            name: "One",
            description: "One",
            amount: 12,
            quantity: 1,
            recurrenceDuration: "1M",
            recurrenceTimes: "10"
          }
        ]
      }}
      paymentInfo_owed={{
        currency: "USD",
        total: 0
      }}
      paymentInfo_received={{
        currency: "USD",
        total: 0
      }}
      paymentMethods={[]}
      onPaymentComplete={e => e}
      onPaymentError={e => e}
      responseId={"responseId"}
      formId={"formId"}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("Amount already paid");
});

describe("calculatePaymentInfo()", () => {
  it("calculates simple paymentInfo", () => {
    let paymentInfo = {
      items: [
        {
          amount: "2",
          quantity: "2"
        }
      ]
    };
    let formData = {};
    let expectedPaymentInfo = {
      total: 4,
      items: [
        {
          amount: 2,
          quantity: 2
        }
      ]
    };
    expect(calculatePaymentInfo(paymentInfo, formData)).toEqual(
      expectedPaymentInfo
    );
  });
  it("calculates total items in paymentInfo last", () => {
    let paymentInfo = {
      items: [
        {
          amount: "2",
          quantity: "2"
        },
        {
          amount: "-0.1 * $total",
          quantity: "1"
        }
      ]
    };
    let formData = {};
    let expectedPaymentInfo = {
      total: 3.6,
      items: [
        {
          amount: 2,
          quantity: 2
        },
        {
          amount: -0.4,
          quantity: 1
        }
      ]
    };
    expect(calculatePaymentInfo(paymentInfo, formData)).toEqual(
      expectedPaymentInfo
    );
  });
  it("doesn't include installments in total calculation", () => {
    let paymentInfo = {
      items: [
        {
          amount: "2",
          quantity: "2"
        },
        {
          amount: "0.5 * $total",
          quantity: "1",
          recurrenceDuration: "1M",
          recurrenceTimes: 2,
          installment: true
        }
      ]
    };
    let formData = {};
    let expectedPaymentInfo = {
      total: 4,
      items: [
        {
          amount: 2,
          quantity: 2
        },
        {
          amount: 2,
          quantity: 1,
          recurrenceDuration: "1M",
          recurrenceTimes: 2,
          installment: true
        }
      ]
    };
    expect(calculatePaymentInfo(paymentInfo, formData)).toEqual(
      expectedPaymentInfo
    );
  });
  it("calculates installments from multiple totals", () => {
    let paymentInfo = {
      items: [
        {
          amount: "2",
          quantity: "2"
        },
        {
          amount: "-0.25 * $total",
          quantity: "1"
        },
        {
          amount: "-0.25 * $total",
          quantity: "1"
        },
        {
          amount: "0.5 * $total",
          quantity: "1",
          recurrenceDuration: "1M",
          recurrenceTimes: 2,
          installment: true
        }
      ]
    };
    let formData = {};
    let expectedPaymentInfo = {
      total: 2,
      items: [
        {
          amount: 2,
          quantity: 2
        },
        {
          amount: -1,
          quantity: 1
        },
        {
          amount: -1,
          quantity: 1
        },
        {
          amount: 1,
          quantity: 1,
          recurrenceDuration: "1M",
          recurrenceTimes: 2,
          installment: true
        }
      ]
    };
    expect(calculatePaymentInfo(paymentInfo, formData)).toEqual(
      expectedPaymentInfo
    );
  });
});
