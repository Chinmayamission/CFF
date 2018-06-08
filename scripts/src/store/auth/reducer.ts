import { Reducer } from 'redux';

const initialState: any = {
  loggedIn: false,
  profileData: null
};

const auth: Reducer<any> = (state: any = initialState, action): any => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loggedIn: true
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        loggedIn: false
      };
    case 'RENDER_PROFILE':
      return {
        ...state,
        profileData: action.profileData
      };
    default:
      return state;
  }
};

export default auth;