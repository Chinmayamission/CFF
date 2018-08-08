import { Reducer } from 'redux';
import { ResponsesState } from "./types.d";
import { set, cloneDeep } from "lodash-es";

const initialState: ResponsesState = {
  responseData: null,
  responses: null,
  paymentStatusDetailItem: { "amount": "", "currency": "USD", "date": null, "id": "", "method": "" },
  tableHeaders: null,
  tableHeadersDisplayed: null,
  tableData: null,
  tableDataDisplayed: null,
  possibleFieldsToUnwind: null,
  dataOptions: null,
  colsToAggregate: null,
  rowToUnwind: null,
  tableDataOrigObject: null
};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case "SET_RESPONSES":
      return {
        ...state,
        responses: action.responses
      };
    case 'SET_RESPONSE_DATA':
      return {
        ...state,
        responseData: action.responseData
      };
    case "SET_FORM_RESPONSES_TABLE_DISPLAY_DATA":
      return {
        ...state,
        ...action
      };
    case "CHANGE_PAYMENT_STATUS_DETAIL":
      let item = cloneDeep(state.paymentStatusDetailItem);
      set(item, action.key, action.value);
      return {
        ...state,
        paymentStatusDetailItem: item
      }
    default:
      return state;
  }
};

export default form;