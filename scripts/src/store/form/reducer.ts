import { Reducer } from "redux";
import { FormState } from "./types.d";

const initialState: FormState = {
  renderedForm: null,
  renderedResponse: null
};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case "SET_RENDERED_FORM":
      return {
        ...state,
        renderedForm: action.renderedForm
      };
    case "SET_RENDERED_RESPONSE":
      return {
        ...state,
        renderedResponse: action.renderedResponse
      };
    default:
      return state;
  }
};

export default form;
