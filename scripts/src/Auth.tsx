import auth0 from 'auth0-js';
// import {push} from "react-router-redux";
// import history from "../history";
import { Auth0Lock } from 'auth0-lock';

const domain = 'ccmt.auth0.com';
const clientId = 'MAHnXGNLh75wmnIme2hpQsDLAzJ5yEzT';

class Auth {
  auth0 = new auth0.WebAuth({
    domain: domain,
    clientID: clientId
  });
  lock = new Auth0Lock(clientId, domain, {
    theme: {
      logo: "https://cmdfw.org/wp-content/uploads/2013/11/Chinmaya-Mission-Logo-color.gif",
      primaryColor: "darkred"
    },
    auth: {
      redirect: false,
      responseType: 'token'
    },
    autoclose: true,
    languageDictionary: {
      title: "Log in"
    }
  });
  userProfile;

  login(callback?) {
    this.lock.on("authenticated", (authResult) => {
      auth.setSession(authResult);
      if (callback) callback();
    }).show();
    // this.auth0.authorize();
  }
  logout(callback?) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    if (callback) callback();
  }

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        console.log(err);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the Access Token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  isAuthenticated() {
    // Check whether the current time is past the 
    // Access Token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
  
  getAccessToken() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No Access Token found');
    }
    return accessToken;
  }

  getProfile(cb) {
    let accessToken = this.getAccessToken();
    return this.auth0.client.userInfo(accessToken, cb);
  }

}

let auth = new Auth();
export default auth;