/// <reference path="./types.d.ts" />
import { Reducer } from 'redux';

const initialState: IAuthState = {
  loggedIn: false,
  user: null,
  userId: null
};

const auth: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loggedIn: true,
        user: action.user,
        userId: `cff:cognitoIdentityId:${action.user.id}`
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        loggedIn: false
      };
    default:
      return state;
  }
};

export default auth;