import React from "react";
import { shallow, mount, render } from 'enzyme';
import { Provider } from "react-redux";
import PaymentHistory from "../../admin/ResponseTable/ResponseCards/PaymentHistory";
import store from "../../store";
import { setResponseDetail } from "../../store/responses/actions";
import { IResponse } from "../../store/responses/types";

it('no payments found', () => {
  let response: IResponse = { "payment_status_detail": [], "value": {}, "amount_paid": "0", "paid": false, "payment_trail": null };
  store.dispatch(setResponseDetail(response))
  const wrapper = render(
    <Provider store={store}><PaymentHistory /></Provider>
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("No rows found");
});

it('render several types of payments', () => {
  let response: IResponse = {
    "payment_status_detail": [
      {"amount": "12", "currency": "USD", "date": {"$date": "date1"}, "id": "id1", "method": "paypal_ipn"},
      {"amount": "24", "currency": "USD", "date": {"$date": "date1"}, "id": "id1", "method": "paypal_ipn"}
    ],
    "value": {}, "amount_paid": "0", "paid": false, "payment_trail": null };
  store.dispatch(setResponseDetail(response))
  const wrapper = render(
    <Provider store={store}><PaymentHistory /></Provider>
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("$12.00");
  expect(wrapper.text()).toContain("$24.00");
  expect(wrapper.text()).not.toContain("No rows found");
});