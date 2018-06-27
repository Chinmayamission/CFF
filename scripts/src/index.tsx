import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App";
import Amplify, {Auth} from "aws-amplify";

declare var MODE: any;
let ENDPOINT_URL = "";
let local = false;
switch (MODE) {
  case "dev":
    ENDPOINT_URL = `http://localhost:8001/`;
    local = true;
    break;
  case "beta":
    ENDPOINT_URL = `https://5fd3dqj2dc.execute-api.us-east-1.amazonaws.com/`;
    break;
  case "prod":
  default:
    ENDPOINT_URL = `https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/`;
    break;
}

Amplify.configure({
  Auth: {
  // REQUIRED - Amazon Cognito Identity Pool ID
      identityPoolId: 'us-east-1:1ed8f7a7-74f9-4263-8791-88d88bbce0c9',
  // REQUIRED - Amazon Cognito Region
      region: 'us-east-1',
  // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: 'us-east-1_Whs9pJeeC',
  // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolWebClientId: '37pr7blrgb8ec5lvj8pac1jlot',
  // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
      mandatorySignIn: false,
  // OPTIONAL - Configuration for cookie storage
      cookieStorage: {
      // REQUIRED - Cookie domain (only required if cookieStorage is provided)
          domain: '.chinmayamission.com',
      // OPTIONAL - Cookie path
          path: '/',
      // OPTIONAL - Cookie expiration in days
          expires: 365,
      // OPTIONAL - Cookie secure flag
          secure: true
      }
  },
  API: {
    endpoints: [
        {
            name: "CFF_v1",
            endpoint: local ? ENDPOINT_URL: `${ENDPOINT_URL}api/`
        },
        {
            name: "CFF_v2",
            endpoint: local ? ENDPOINT_URL: `${ENDPOINT_URL}v2/`
        }
    ]
  }
});

ReactDOM.render(<App />, document.getElementById('ccmt-cff-main'));
import "./form.tsx";