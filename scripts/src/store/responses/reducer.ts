import { Reducer } from 'redux';
import { ResponsesState } from "./types.d";
import { set, cloneDeep } from "lodash-es";

const initialState: ResponsesState = {
  responseData: null,
  paymentStatusDetailItem: {"amount": "", "currency": "USD", "date": null, "id": "", "method": ""}
};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'SET_RESPONSE_DATA':
      return {
        ...state,
        responseData: action.responseData
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