/// <reference path="./types.d.ts" />
import { Reducer } from 'redux';

const initialState: IAuthState = {
  loggedIn: false,
  user: null,
  userId: null,
  authMethod: null,
  schemas: require("./schemas.json"),
  error: null,
  message: null
};

const auth: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loggedIn: true,
        user: action.attributes,
        userId: `cm:cognitoUserPool:${action.userId}`
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
    case "SET_MESSAGE":
      return {
        ...state,
        message: action.message
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.error
      }
    default:
      return state;
  }
};

export default auth;