import React from "react";
import { shallow, mount, render } from 'enzyme';
import { Provider } from "react-redux";
import PaymentHistory from "../../admin/ResponseTable/ResponseCards/PaymentHistory";
import store from "../../store";
import { IResponse } from "../../store/responses/types";
import sinon from "sinon";
import ResponseTable from "../../admin/ResponseTable/ResponseTable";

it('renders default response table', () => {
  // let response: IResponse = { "payment_status_detail": [], "value": {}, "amount_paid": "0", "paid": false, "payment_trail": null };
  // store.dispatch(setResponseDetail(response))
  const wrapper = mount(
    <Provider store={store}><ResponseTable match={{params: {formId: 123}}} /></Provider>
  );
  expect(wrapper).toMatchSnapshot();
});