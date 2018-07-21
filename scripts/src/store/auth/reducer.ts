/// <reference path="./types.d.ts" />
import { Reducer } from 'redux';

const schema = {
  "type": "object",
  "title": "Log in",
  "properties": {
    "email": {"type": "string", "title": "Email Address"},
    "password": {"type": "string", "title": "Password"}
  }
}

const uiSchema = {
  "password": {"ui:widget": "password"},
  "ui:cff:submitButtonText": "Login"
}

const initialState: IAuthState = {
  loggedIn: false,
  user: null,
  userId: null,
  authMethod: null,
  authForm: {
    schema: schema,
    uiSchema: uiSchema
  }
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
    default:
      return state;
  }
};

export default auth;