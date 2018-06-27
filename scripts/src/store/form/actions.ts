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

export function login() {
  return dispatch => {
    // Retrieve active Google user session
    const ga = (window as any).gapi.auth2.getAuthInstance();
    ga.signIn().then(googleUser => {
        const { id_token, expires_at } = googleUser.getAuthResponse();
        const profile = googleUser.getBasicProfile();
        const user = {
            email: profile.getEmail(),
            name: profile.getName()
        };
        console.log(user);
        let credentials = {"provider": "google", "expires_at": expires_at, "token": id_token, user};
        dispatch(federatedSignIn(credentials));
    });
  }
}
export function logout() {
  return dispatch => {
    Cache.setItem("federatedInfo", null);
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
export function checkLoginStatus() {
  return dispatch => {
    let session = Auth.currentAuthenticatedUser().then((creds: IUserCredentials) => {
      if (!creds) throw "No credentials";
      console.log("logged in", creds);
      dispatch(loggedIn(creds));
    }).catch(e => {
      let credentials: IFederatedCredentials = Cache.getItem('federatedInfo');
      if (credentials) {
        console.log("cache is", credentials);
        dispatch(federatedSignIn(credentials));
      }
      else {
        dispatch(loggedOut());
      }
    });
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
      dispatch(checkLoginStatus());
      // dispatch(loggedIn()); return;
    }
  }
}