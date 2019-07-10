import React from "react";
import { shallow, mount, render } from "enzyme";
import Payment from "../form/confirmation/payment";

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
