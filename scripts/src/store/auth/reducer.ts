/// <reference path="./types.d.ts" />
import { Reducer } from 'redux';

const initialState: IAuthState = {
  loggedIn: false,
  user: null,
  userId: null,
  authMethod: null
};

const auth: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      console.log("LOGIN_SUCCESS", action);
      return {
        ...state,
        loggedIn: true,
        user: action.attributes,
        userId: `cff:cognitoIdentityId:${action.userId}`
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        loggedIn: false
      };
    case "SET_AUTH_METHOD":
      return {
        ...state,
        authMethod: action.authMethod
      }
    default:
      return state;
  }
};

export default auth;