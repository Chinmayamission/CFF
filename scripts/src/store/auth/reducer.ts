import { Reducer } from "redux";
import { IAuthState } from "./types";

const initialState: IAuthState = {
  loggedIn: false,
  user: null,
  userId: null,
  schemas: require("./schemas.json"),
  error: null,
  message: null,
  authPage: "signIn",
  cognitoUser: null,
  loginUrl:
    window.location != window.parent.location
      ? document.referrer
      : window.location.href
};

const auth: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loggedIn: true,
        user: action.attributes,
        userId: `cm:cognitoUserPool:${action.userId}`
      };
    case "LOGOUT_SUCCESS":
      return {
        ...state,
        loggedIn: false
      };
    case "SET_AUTH_PAGE":
      return {
        ...state,
        authPage: action.authPage,
        message: action.message,
        error: action.error
      };
    case "SET_MESSAGE":
      return {
        ...state,
        message: action.message
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.error
      };
    case "SET_LOGIN_URL":
      return {
        ...state,
        loginUrl: action.loginUrl
      };
    case "SET_COGNITO_USER":
      return {
        ...state,
        cognitoUser: action.cognitoUser
      };
    default:
      return state;
  }
};

export default auth;
