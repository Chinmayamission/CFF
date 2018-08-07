import { Reducer } from 'redux';
import { IAdminState } from "./types.d";
import { set, cloneDeep } from "lodash-es";

const initialState: IAdminState = {
  formList: []
};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'SET_FORM_LIST':
      return {
        ...state,
        formList: action.formList
      };
    default:
      return state;
  }
};

export default form;