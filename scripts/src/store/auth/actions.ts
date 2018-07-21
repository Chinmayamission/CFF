/// <reference path="./types.d.ts" />
import fetch from "cross-fetch";
import { Auth } from "aws-amplify";
import { Cache } from 'aws-amplify';
import { loadingStart, loadingEnd } from "src/store/base/actions";
import { setupMaster } from "cluster";

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

export function logout() {
  return dispatch => {
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
export function checkLoginStatus() {
  return (dispatch, getState) => {
    dispatch(loadingStart());
    // getUserCredentials(), currentAuthenticatedUser()
    // let session = Auth.currentCredentials().then(e => {
    //   console.log("currentCredentials are", e);
    //   return Auth.currentAuthenticatedUser();
    // })
    Auth.currentAuthenticatedUser()
    .then((user: {username: string, attributes: IUserAttributes}) => {
      if (!user) throw "No credentials";
      dispatch(loadingEnd());
      dispatch(loggedIn(user.username, user.attributes));
    }).catch(e => {
      console.error(e);
    });
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

export const setAuthMethod = (method_name) => ({
  type: 'SET_AUTH_METHOD',
  authMethod: method_name
});

export const setMessage = (message) => ({
  type: 'SET_MESSAGE',
  message: message
})

export const onAuthError = (error) => ({
  type: 'SET_ERROR',
  error: JSON.stringify(error)
})

export function signIn(data) {
  return dispatch => {
    dispatch(loadingStart());
    Auth.signIn(data.email, data.password)
    .then(() => dispatch(checkLoginStatus()))
    .catch(e => dispatch(onAuthError(e)))
  }
}

export function signUp(data) {
  return dispatch => {
    if (data.password != data.password2) {
      dispatch(onAuthError("Passwords do not match."));
      return;
    }
    dispatch(loadingStart());
    Auth.signUp({
      username: data.email,
      password: data.password,
      attributes: {
        email: data.email,
        name: "User"
      }
    })
    .then(() => dispatch(setMessage("Account creation complete. Please check your email for a confirmation link to confirm your email address, then sign in.")))
    .catch(e => dispatch(onAuthError(e)))
    .then(() => dispatch(loadingEnd()))
  }
}

export function forgotPassword(data) {
  return dispatch => {
    dispatch(loadingStart());
    Auth.forgotPassword(data.email)
    .then(() => dispatch(setMessage("Please check your email for a link to change your password.")))
    .catch(e => dispatch(onAuthError(e)))
    .then(() => dispatch(loadingEnd()))
  }
}