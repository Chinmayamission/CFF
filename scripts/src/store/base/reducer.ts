import {IBaseState} from "./types";
import { Reducer } from 'redux';

const initialState: IBaseState = {
  loading: false,
  bootstrap: true
};

const auth: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'SET_BOOTSTRAP':
      return {
        ...state,
        bootstrap: action.bootstrap
      };
    case 'LOADING_START':
      return {
        ...state,
        loading: true
      };
    case 'LOADING_END':
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
};

export default auth;