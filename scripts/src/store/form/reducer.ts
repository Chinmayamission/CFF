import { Reducer } from 'redux';
import {FormState} from "./types.d";

const initialState: FormState = {
  formData: null,
  loading: false
};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: action.formData
      };
    case "SET_FORM_LOADING":
      return {
        ...state,
        loading: action.loading
      }
    default:
      return state;
  }
};

export default form;