import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App";
import Amplify, {Auth} from "aws-amplify";
import { I18n } from 'aws-amplify';

import store from "./store";
import {Provider} from "react-redux";

declare var MODE: any;
declare var ENDPOINT_URL: any;

Amplify.configure({
  Auth: {
  // REQUIRED - Amazon Cognito Identity Pool ID
      identityPoolId: 'us-east-1:1ed8f7a7-74f9-4263-8791-88d88bbce0c9',
  // REQUIRED - Amazon Cognito Region
      region: 'us-east-1',
  // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: 'us-east-1_kcpcLxLzn',
  // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolWebClientId: '77mcm1k9ll2ge68806h5kncfus',
  // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
      mandatorySignIn: false
  },
  API: {
    endpoints: [
        {
            name: "CFF",
            endpoint: ENDPOINT_URL,
            custom_header: async () => { 
                try {
                    return { Authorization: (await Auth.currentSession()).idToken.jwtToken } 
                }
                catch (e) {
                    return { Authorization: "anonymous" }
                }
            }
        }
    ]
  }
});

const authScreenLabels = {
    en: {
        'Sign Up': 'Create new account',
        'Sign Up Account': 'New member? Create a new account',
        'Sign In Account': 'Sign In'
    }
};

I18n.setLanguage('en');
I18n.putVocabularies(authScreenLabels);

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('ccmt-cff-main'));