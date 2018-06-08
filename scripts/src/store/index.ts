import { combineReducers, Dispatch, Reducer } from 'redux';

import authReducer from './auth/reducer';

export const reducers: Reducer = combineReducers({
  auth: authReducer,
});
