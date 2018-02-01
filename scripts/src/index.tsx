import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './form/FormPage';
import { BrowserRouter } from 'react-router-dom';
import "./common/main.scss";
import * as DOMPurify from 'dompurify';
import Amplify from 'aws-amplify';
import FormAdminPage from './admin/FormAdminPage';


Amplify.configure({
  Auth: {
    identityPoolId: 'us-east-1:1ed8f7a7-74f9-4263-8791-88d88bbce0c9', //REQUIRED - Amazon Cognito Identity Pool ID
    region: 'us-east-1', // REQUIRED - Amazon Cognito Region
    //userPoolId: 'us-east-1_Whs9pJeeC', //OPTIONAL - Amazon Cognito User Pool ID
    //userPoolWebClientId: '22c1i8353eo9qvfdpo352r7el7', //OPTIONAL - Amazon Cognito Web Client ID
  }
});
const federated = {
  google_client_id: '',
  facebook_app_id: 144255189598716,
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
      <FormPage formId={formRenderElement.getAttribute('data-ccmt-cff-form-id')} apiEndpoint={formRenderElement.getAttribute('data-ccmt-cff-api-endpoint')} />
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
        federated={federated}
        />
    </div>,
    formAdminElement
  );

}
