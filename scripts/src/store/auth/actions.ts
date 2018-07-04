/// <reference path="./types.d.ts" />
import fetch from "cross-fetch";
import {Auth} from "aws-amplify";
import { Cache } from 'aws-amplify';


export const loggedIn = (user) => ({
  type: 'LOGIN_SUCCESS',
  user
});

export const loggedOut = () => ({
  type: 'LOGOUT_SUCCESS'
});
export const renderProfile = (profileData) => ({
  type: 'RENDER_PROFILE',
  profileData
})
export function federatedSignIn(credentials: IFederatedCredentials) {
  return dispatch => {
    let {provider, token, expires_at} = credentials;
    let user = {"a":"b"};
    return Auth.federatedSignIn(
      provider,
      { 
          // the JWT token
          token: token,
          // the expiration time
          expires_at 
      },
      // a user object
      user
    ).then((e) => {
        console.warn(e);
        dispatch(checkLoginStatus());
    });
  }
}

export function logout() {
  return dispatch => {
    console.log("signing out");
    Cache.removeItem("federatedInfo");
    localStorage.clear();
    console.log(Cache.getAllKeys());
    Auth.signOut().then(e => {
      const ga = (window as any).gapi.auth2.getAuthInstance();
      return ga.signOut();
    }).then(e => Auth.signOut()).then(e => {
      dispatch(loggedOut());
    })
  }
}
// export function getProfile() {
//   return dispatch => {
//     auth.getProfile((err, profileData: IProfileData) => {
//       dispatch(renderProfile(profileData));
//     });
//   }
// }
export function checkLoginStatus(authMethod="") {
  return (dispatch, getState) => {
    function getUserCredentials() {
      return Auth.currentCredentials().then(e => {
        console.log("currentCredentials are", e);
        if (!e) {
          // federated_identity
          return Auth.currentAuthenticatedUser();
        }
        // user pool
        return {"name": "Name", "email": "email@email.com", "id": e.data.IdentityId};
      });
    }
    let credsPromise = getUserCredentials();
    if (!credsPromise) {
      // dispatch(loggedOut());
      return;
    }
    let session = credsPromise.then((creds: IUserCredentials) => {
      if (!creds) throw "No credentials";
      console.log("logged in", creds);
      dispatch(loggedIn(creds));
    }).catch(e => {
      console.error(e);
      // Auth.currentSession().then(e => {
      //   let credentials: IFederatedCredentials = Cache.getItem('federatedInfo');
      // })
      
      // if (credentials) {
      //   console.log("cache is", credentials);
      //   dispatch(federatedSignIn(credentials));
      // }
      // else {
      //   console.log()
      //   dispatch(loggedOut());
      // }
    });
    console.log(session);
    // console.log(Cache.getItem('federatedInfo'))
    // const credentials: IFederatedCredentials = Cache.getItem('federatedInfo');
    // console.log(credentials.token);

    // dispatch((auth.isAuthenticated() ? loggedIn : loggedOut)());
  }
}
export function handleAuthStateChange(state, data) {
  return dispatch => {
    console.log(state, data);
    if (state == "signedIn") {
      if (data) {
        dispatch(checkLoginStatus("user_pool"));
      }
      else {
        dispatch(checkLoginStatus("federated_identity"));
      }
      // dispatch(loggedIn()); return;
    }
  }
}

export const setAuthMethod = (method_name) => ({
  type: 'SET_AUTH_METHOD',
  authMethod: method_name
});
