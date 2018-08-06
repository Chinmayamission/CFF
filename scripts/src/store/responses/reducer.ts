import { Reducer } from 'redux';
import { ResponsesState } from "./types.d";

const initialState: ResponsesState = {

};

const form: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    default:
      return state;
  }
};

export default form;