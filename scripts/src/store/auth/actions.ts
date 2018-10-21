
import { API, Auth } from "aws-amplify";
import { Cache } from 'aws-amplify';
import { loadingStart, loadingEnd } from "src/store/base/actions";
import { IUserAttributes, IAuthState } from "./types";
import { resolve } from "path";

export const loggedIn = (userId, attributes) => ({
  type: 'LOGIN_SUCCESS',
  userId,
  attributes
});

export const loggedOut = () => ({
  type: 'LOGOUT_SUCCESS'
});
export const renderProfile = (profileData) => ({
  type: 'RENDER_PROFILE',
  profileData
});
export const setCognitoUser = (cognitoUser) => ({
  type: "SET_COGNITO_USER",
  cognitoUser
});

export function logout() {
  return dispatch => {
    (window as Window).parent.postMessage({"action": "logout"}, "*");
    loadingStart();
    console.log("signing out");
    Cache.removeItem("federatedInfo");
    localStorage.clear();
    console.log(Cache.getAllKeys());
    Auth.signOut().then(e => {
      loadingEnd();
      dispatch(loggedOut());
    })
  }
}

function getCurrentUser() {
  let jwt = localStorage.getItem("jwt");
  if (jwt) {
    /*
    ud: "2511g7rmn8p70losdlh9gi9j0"
    auth_time: 1533327899
    cognito:username: "d10dbb72-8884-4eee-99d0-d4aa87eb280d"
    email: "aramaswamis@gmail.com"
    email_verified: true
    event_id: "4af7ecbe-975b-11e8-9b04-e9c3e9a6969b"
    exp: 1533331712
    iat: 1533328112
    iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_U9ls8R6E3"
    name: "User"
    sub: "d10dbb72-8884-4eee-99d0-d4aa87eb280d"
    token_use: "id"
    website: "http://localhost:8000/admin/"
    */
    return API.post("CFF", "authorize", { "body": { "token": jwt } })
      .then(e => {
        let attributes: IUserAttributes = { "name": e.name, "email": e.email, "email_verified": e.email_verified };
        return {
          "username": e["cognito:username"],
          attributes
        }
      })
      .catch(e => Auth.currentAuthenticatedUser())
  }
  else {
    return Auth.currentAuthenticatedUser();
  }
}
// function getCurrentUser() {
//   localStorage.setItem("jwt", "jwt");
//   return new Promise((resolve) => resolve({ "username": "f31c1cb8-681c-4d3e-9749-d7c074ffd7f6", "attributes": { "name": "Local Host", "email": "email@email.com", "email_verified": true } }));
// }

export function checkLoginStatus() {
  return (dispatch, getState) => {
    dispatch(loadingStart());
    const jwt = localStorage.getItem("jwt");
    getCurrentUser()
      .then((user: { username: string, attributes: IUserAttributes }) => {
        if (!user) throw "No credentials";
        console.log("creds", user);
        dispatch(loggedIn(user.username, user.attributes));
      }).catch(e => {
        console.error(e);
        // (window as Window).parent.postMessage({"action": "login", "jwt": jwt}, "*");
        // TODO: is this a security vulnerability? Sends jwt so the parent iframe knows if problem is due to bad jwt or because jwt hasn't been sent yet.
      }).then(() => dispatch(loadingEnd()));
  }
}
export function handleAuthStateChange(state, data) {
  return dispatch => {
    console.log(state, data);
    if (state == "signedIn") {
      if (data) {
        // user_pool
        dispatch(checkLoginStatus());
      }
      else {
        // federated_identity
        dispatch(checkLoginStatus());
      }
      // dispatch(loggedIn()); return;
    }
  }
}

export const setAuthPage = (authPage, message = "", error = "") => ({
  type: 'SET_AUTH_PAGE',
  authPage: authPage,
  message: message,
  error: error
})

export const setMessage = (message) => ({
  type: 'SET_MESSAGE',
  message: message
})

export const onAuthError = (error) => ({
  type: 'SET_ERROR',
  error: error
})

export const setLoginUrl = (loginUrl: string) => ({
  type: 'SET_LOGIN_URL',
  loginUrl
})

export function signIn(data) {
  return dispatch => {
    dispatch(loadingStart());
    Auth.signIn(data.email.toLowerCase(), data.password)
      .then(() => localStorage.removeItem("jwt"))
      .then(() => dispatch(checkLoginStatus()))
      .catch(e => dispatch(onAuthError(e.message)))
      .then(() => dispatch(loadingEnd()))
  }
}

export function signUp(data) {
  return (dispatch, getState) => {
    if (data.password != data.password2) {
      dispatch(onAuthError("Passwords do not match."));
      return;
    }
    dispatch(loadingStart());
    Auth.signUp({
      username: data.email.toLowerCase(),
      password: data.password,
      attributes: {
        email: data.email.toLowerCase(),
        name: "User",
        website: (getState().auth as IAuthState).loginUrl // Link for confirmation email
      }
    })
      .then(() => dispatch(setAuthPage("signIn", "Account creation complete. Please check your email for a confirmation link to confirm your email address, then sign in below. If you don't see the email, please check your spam folder.")))
      .catch(e => dispatch(onAuthError(e.message)))
      .then(() => dispatch(loadingEnd()))
  }
}

export function forgotPassword(data) {
  return dispatch => {
    dispatch(loadingStart());
    Auth.forgotPassword(data.email)
      .then(() => dispatch(setAuthPage("forgotPasswordSubmit", "Verification email sent. Please check your email for a code and enter the code below to change your password. If you don't see the email, please check your spam folder.")))
      .catch(e => dispatch(onAuthError(e.message)))
      .then(() => dispatch(loadingEnd()))
  }
}

export function forgotPasswordSubmit(data) {
  return dispatch => {
    if (data.password != data.password2) {
      dispatch(onAuthError("Passwords do not match."));
      return;
    }
    dispatch(loadingStart());
    Auth.forgotPasswordSubmit(data.email, data.code, data.password)
      .then(() => dispatch(setAuthPage("signIn", "Password changed successfully! Please log in with your new password.")))
      .catch(e => dispatch(onAuthError(e.message)))
      .then(() => dispatch(loadingEnd()))
  }
}