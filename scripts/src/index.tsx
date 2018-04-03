import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './form/FormPage';
import { BrowserRouter } from 'react-router-dom';
import "./common/main.scss";
import * as DOMPurify from 'dompurify';
import Amplify from 'aws-amplify';
import FormAdminPage from './admin/FormAdminPage';

declare var MODE: string;

let ENDPOINT_URL = "";
switch (MODE) {
  case "dev":
    ENDPOINT_URL = "https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/";
    break;
  case "beta":
    ENDPOINT_URL = "https://5fd3dqj2dc.execute-api.us-east-1.amazonaws.com/api/";
    break;
  case "prod":
  default:
    ENDPOINT_URL = "https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/api/";
    break;
}

// (window as any).LOG_LEVEL = 'DEBUG'
Amplify.configure({
  Auth: {
    identityPoolId: 'us-east-1:1ed8f7a7-74f9-4263-8791-88d88bbce0c9', //REQUIRED - Amazon Cognito Identity Pool ID
    region: 'us-east-1', // REQUIRED - Amazon Cognito Region
    userPoolId: 'us-east-1_Whs9pJeeC', //OPTIONAL - Amazon Cognito User Pool ID
    userPoolWebClientId: '37pr7blrgb8ec5lvj8pac1jlot', //OPTIONAL - Amazon Cognito Web Client ID
    mandatorySignIn: false
  },
  API: {
    endpoints: [
      {
        name: "CFF",
        endpoint: ENDPOINT_URL
      }
    ]
  }
});

const federated = {
  google_client_id: '766882331202-ccnggd9cf0h54h9k5nn6ouqhgmeesrju.apps.googleusercontent.com',
  facebook_app_id: '',
  amazon_client_id: ''
};


// dev apiEndpoint https://l5nrf4co1g.execute-api.us-east-1.amazonaws.com/dev/forms
// dev apiKey test

(window as any).CCMT_CFF_DEVMODE = false;
(window as any).CCMT_CFF_DEVMODE_AUTOFILL = false;


// Make all external links in form open in a new tab.
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // set all elements owning target to target=_blank
  if ('target' in node) {
    node.setAttribute('target', '_blank');
  }
});

let formRenderElement = document.getElementById('ccmt-cff-render') as HTMLElement;
if (formRenderElement) {
  ReactDOM.render(
    <div className="ccmt-cff-Wrapper-Bootstrap">
      <FormPage formId={formRenderElement.getAttribute('data-ccmt-cff-form-id')}
        authKey={formRenderElement.getAttribute('data-ccmt-cff-auth-key')}
        specifiedShowFields={(formRenderElement.getAttribute('data-ccmt-cff-specified-show-fields') || "").split(",")}
        apiEndpoint={formRenderElement.getAttribute('data-ccmt-cff-api-endpoint')} />
    </div>
    ,
    formRenderElement
  );
}

let formAdminElement = document.getElementById('ccmt-cff-admin') as HTMLElement;
if (formAdminElement) {
  ReactDOM.render(
    <div className="ccmt-cff-Wrapper-Bootstrap">
      <FormAdminPage
        apiEndpoint={formAdminElement.getAttribute('data-ccmt-cff-api-endpoint')}
        apiKey={formAdminElement.getAttribute('data-ccmt-cff-api-key')}
        //authState={"auth"}
        //authData={{"id": formAdminElement.getAttribute('data-ccmt-cff-api-key'), "name": "Ashwin"}}
        federated={federated}
        />
    </div>,
    formAdminElement
  );

}
