import fetch from "cross-fetch";
import { Auth0Lock } from 'auth0-lock';
import auth from "src/Auth";

declare const ENDPOINT_URL: string;

export const loggedIn = () => ({
  type: 'LOGIN_SUCCESS',
});

export const loggedOut = () => ({
  type: 'LOGOUT_SUCCESS'
});
export const renderProfile = (profileData) => ({
  type: 'RENDER_PROFILE',
  profileData
})
export function login() {
  return dispatch => {
    auth.login(() => dispatch(loggedIn()));
  }
}
export function logout() {
  return dispatch => {
    auth.logout(() => dispatch(loggedOut()));
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
    dispatch((auth.isAuthenticated() ? loggedIn : loggedOut)());
  }
}