import React from "react";
import { connect } from 'react-redux';
import {checkLoginStatus, login, logout} from "../store/auth/actions";

const mapStateToProps = state => ({
  ...state.auth
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  // getProfile: () => dispatch(getProfile()),
  checkLoginStatus: () => dispatch(checkLoginStatus()),
  login: () => dispatch(login()),
  logout: () => dispatch(logout())
});


function Login(props) {
  if (!props.loggedIn) {
    return (<div>
      <button className="btn btn-primary" onClick={() => props.login()}>Login</button>
    </div>);
  }
  else {
    return (<div>
      <button className="btn" onClick={() => props.logout()}>Logout</button>
    </div>);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);