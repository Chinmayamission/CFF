import { mount } from 'enzyme';
import React from "react";
import { Provider } from "react-redux";
import ResponseTable from "../../admin/ResponseTable/ResponseTable";
import store from "../../store";

it('renders default response table', () => {
  // let response: IResponse = { "payment_status_detail": [], "value": {}, "amount_paid": "0", "paid": false, "payment_trail": null };
  // store.dispatch(setResponseDetail(response))
  const wrapper = mount(
    <Provider store={store}><ResponseTable match={{ params: { formId: 123 } }} /></Provider>
  );
  expect(wrapper).toMatchSnapshot();
});

// store.dispatch(setRenderedForm({"schema": schema, "uiSchema": {}, "name": "Form", "formOptions": {"paymentInfo": null, "paymentMethods": null, "confirmationEmailInfo": null, "dataOptions": dataOptions} } ));
// store.dispatch(setResponses([]));
// store.dispatch(setResponsesSelectedView("main"));
// const wrapper = render(
//   <Provider store={store}><ResponseTableView /></Provider>
// );
// expect(wrapper).toMatchSnapshot();