import React from "react";
import { shallow, mount, render } from "enzyme";
import { Provider } from "react-redux";
import PaymentHistory from "../../admin/ResponseTable/ResponseCards/PaymentHistory";
import store from "../../store";
import {
  setResponseDetail,
  onPaymentStatusDetailChange,
  submitNewPayment
} from "../../store/responses/actions";
import { IResponse } from "../../store/responses/types";
import sinon from "sinon";
import MockDate from "mockdate";

describe("PaymentHistory", () => {
  beforeEach(() => {
    // todo: mock date doesn't work
    MockDate.set("7/14/2019");
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("renders table with no payments found", () => {
    let response: IResponse = {
      payment_status_detail: [],
      value: {},
      amount_paid: "0",
      paid: false,
      payment_trail: null,
      paymentInfo: {
        total: 0
      }
    };
    store.dispatch(setResponseDetail(response));
    const wrapper = render(
      <Provider store={store}>
        <PaymentHistory />
      </Provider>
    );
    expect(wrapper.text()).toContain("No rows found");
    // expect(wrapper).toMatchSnapshot();
  });

  it("render several types of payments", () => {
    let response: IResponse = {
      payment_status_detail: [
        {
          amount: "12",
          currency: "USD",
          date: { $date: "date1" },
          id: "id1",
          method: "paypal_ipn"
        },
        {
          amount: "24",
          currency: "USD",
          date: { $date: "date1" },
          id: "id2",
          method: "paypal_ipn"
        }
      ],
      value: {},
      amount_paid: "0",
      paid: false,
      payment_trail: null,
      paymentInfo: {
        total: 0
      }
    };
    store.dispatch(setResponseDetail(response));
    const wrapper = render(
      <Provider store={store}>
        <PaymentHistory />
      </Provider>
    );
    expect(wrapper.text()).toContain("$12.00");
    expect(wrapper.text()).toContain("id1");
    expect(wrapper.text()).toContain("id2");
    expect(wrapper.text()).toContain("$24.00");
    expect(wrapper.text()).not.toContain("No rows found");
    // expect(wrapper).toMatchSnapshot();
  });

  it("Does not let you add a new payment when all fields are not entered", () => {
    let response: IResponse = {
      _id: { $oid: 123 },
      payment_status_detail: [],
      value: {},
      amount_paid: "0",
      paid: false,
      payment_trail: null,
      paymentInfo: {
        total: 0
      }
    };
    store.dispatch(setResponseDetail(response));
    const spy = sinon.spy();
    const wrapper = mount(
      <Provider store={store}>
        <PaymentHistory submitNewPayment={spy} />
      </Provider>
    );
    wrapper.find(".cff-payment-history-btn-add").simulate("click");
    expect(spy.calledOnce).toBe(false);
  });

  it("Lets you add a new payment", () => {
    let response: IResponse = {
      _id: { $oid: 123 },
      payment_status_detail: [],
      value: {},
      amount_paid: "0",
      paid: false,
      payment_trail: null,
      paymentInfo: {
        total: 0
      }
    };
    store.dispatch(setResponseDetail(response));
    store.dispatch(onPaymentStatusDetailChange("amount", "40"));
    store.dispatch(onPaymentStatusDetailChange("method", "unittest_method"));
    store.dispatch(onPaymentStatusDetailChange("id", "4011"));
    const spy = sinon.spy();
    store.dispatch = spy;
    const wrapper = mount(
      <Provider store={store}>
        <PaymentHistory />
      </Provider>
    );
    wrapper.find(".cff-payment-history-btn-add").simulate("click");
    // Todo fix
    // expect(spy.calledOnceWith(submitNewPayment({sendEmail: true}))).toBe(true);
  });
});
