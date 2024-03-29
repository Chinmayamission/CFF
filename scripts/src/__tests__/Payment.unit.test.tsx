import React from "react";
import { render } from "enzyme";
import Payment from "../form/confirmation/payment";
import { calculatePaymentInfo } from "../form/payment/PaymentCalcTable";

const props = {
  formId: "formId",
  responseId: "responseId",
  responseMetadata: {}
};

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
            quantity: 1,
            total: 12
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
      {...props}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("Amount already paid");
});

it("renders payment table with currency template", () => {
  const wrapper = render(
    <Payment
      onPaymentStarted={e => e}
      paymentInfo={{
        currency: "USD",
        currencyTemplate:
          "{% if value.nationality == 'India' %}INR{% else %}USD{% endif %}",
        total: 12,
        items: [
          {
            name: "One",
            description: "One",
            amount: 12,
            quantity: 1,
            total: 12
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
      {...props}
      formData={{ nationality: "India" }}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("₹");
  expect(wrapper.text()).not.toContain("$");
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
            quantity: 1,
            total: 12
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
      {...props}
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
            total: 12,
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
      {...props}
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
        total: 120,
        items: [
          {
            name: "One",
            description: "One",
            amount: 12,
            quantity: 1,
            total: 120,
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
      {...props}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("Amount already paid");
});

it("renders installment payment table", () => {
  const wrapper = render(
    <Payment
      onPaymentStarted={e => e}
      paymentInfo={{
        currency: "USD",
        total: 120,
        items: [
          {
            name: "One",
            description: "One",
            amount: 120,
            quantity: 1,
            total: 120
          },
          {
            name: "Installment",
            description: "Installment",
            amount: 12,
            quantity: 1,
            total: 120,
            recurrenceDuration: "1M",
            recurrenceTimes: "10",
            installment: true
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
      {...props}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("Amount already paid");
});

it("doesn't render payment table when paymentInfo.items is none", () => {
  const wrapper = render(
    <Payment
      onPaymentStarted={e => e}
      paymentInfo={{
        currency: "USD",
        total: 12,
        items: []
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
      {...props}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("Description");
});

it("renders redirect and text payment methods when paymentInfo.items is none", () => {
  const wrapper = render(
    <Payment
      onPaymentStarted={e => e}
      paymentInfo={{
        currency: "USD",
        total: 12,
        items: []
      }}
      paymentInfo_owed={{
        currency: "USD",
        total: 0
      }}
      paymentInfo_received={{
        currency: "USD",
        total: 0
      }}
      paymentMethods={{
        redirect: {
          payButtonText: "Redirect"
        },
        text: {
          text: "Test text, hello world"
        }
      }}
      onPaymentComplete={e => e}
      onPaymentError={e => e}
      {...props}
      formData={{}}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("Test text, hello world");
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
    expect(calculatePaymentInfo(paymentInfo, formData, {})).toMatchSnapshot();
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
    expect(calculatePaymentInfo(paymentInfo, formData, {})).toMatchSnapshot();
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
    expect(calculatePaymentInfo(paymentInfo, formData, {})).toMatchSnapshot();
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
    expect(calculatePaymentInfo(paymentInfo, formData, {})).toMatchSnapshot();
  });
});
