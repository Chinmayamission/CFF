import { Reducer } from 'redux';

const initialState: any = {
  loggedIn: false,
  user: null
};

const auth: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loggedIn: true,
        user: action.user
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        loggedIn: false
      };
    default:
      return state;
  }
};

export default auth;