import { Reducer } from 'redux';
import {FormState} from "./types.d";

const initialState: FormState = {
  formData: null
};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: action.formData
      };
    default:
      return state;
  }
};

export default form;