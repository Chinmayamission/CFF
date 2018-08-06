import { Reducer } from 'redux';
import { ResponsesState } from "./types.d";

const initialState: ResponsesState = {
  responseData: null
};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'SET_RESPONSE_DATA':
      return {
        ...state,
        responseData: action.responseData
      };
    default:
      return state;
  }
};

export default form;