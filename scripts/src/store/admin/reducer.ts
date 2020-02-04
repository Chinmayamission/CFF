import { Reducer } from "redux";
import { IAdminState } from "./types.d";
import { set, cloneDeep } from "lodash";

const initialState: IAdminState = {
  formList: null
};

const admin: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case "SET_FORM_LIST":
      return {
        ...state,
        formList: action.formList
      };
    default:
      return state;
  }
};

export default admin;
