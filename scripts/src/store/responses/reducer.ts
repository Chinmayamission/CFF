import { Reducer } from 'redux';
import { ResponsesState, IPaymentStatusDetailItem } from "./types.d";
import { set, cloneDeep } from "lodash-es";
import moment from 'moment';


const defaultPaymentStatusDetailItem: IPaymentStatusDetailItem = { "amount": "", "currency": "USD", "date": {"$date": moment().toISOString()}, "id": "", "method": "" };
const initialState: ResponsesState = {
  responseData: null,
  responses: null,
  paymentStatusDetailItem: defaultPaymentStatusDetailItem,
  selectedView: "main",
  shownResponseDetailId: null
};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case "DISPLAY_RESPONSE_DETAIL":
    return {
      ...state,
      shownResponseDetailId: action.shownResponseDetailId
    }
    case "SET_RESPONSES":
      return {
        ...state,
        responses: action.responses
      };
    case "SET_RESPONSE_DATA":
      return {
        ...state,
        responseData: action.responseData
      };
    case "SET_RESPONSES_SELECTED_VIEW":
      return {
        ...state,
        viewName: action.viewName
      };
    case "CHANGE_PAYMENT_STATUS_DETAIL":
      let item = cloneDeep(state.paymentStatusDetailItem);
      set(item, action.key, action.value);
      return {
        ...state,
        paymentStatusDetailItem: item
      }
    case "CLEAR_PAYMENT_STATUS_DETAIL":
      return {
        ...state,
        paymentStatusDetailItem: defaultPaymentStatusDetailItem
      }
    default:
      return state;
  }
};

export default form;