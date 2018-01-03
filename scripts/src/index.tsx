import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './form/FormPage';
import FormAdminPage from './admin/FormAdminPage';
import { BrowserRouter } from 'react-router-dom';


let config = {
  "cff_api_endpoint": 'https://ajd5vh06d8.execute-api.us-east-2.amazonaws.com/prod/gcmw-cff-render-form',
  "cff_api_key": "test"
};

let formRenderElement = document.getElementById('gcmw-cff-render') as HTMLElement;
if (formRenderElement) {
  ReactDOM.render(
    <FormPage formId={formRenderElement.getAttribute('data-form-id')} apiEndpoint={config.cff_api_endpoint} />,
    formRenderElement
  );
}

let formAdminElement = document.getElementById('gcmw-cff-admin') as HTMLElement;
if (formAdminElement) {
  ReactDOM.render(
    <BrowserRouter>
      <FormAdminPage apiEndpoint={config.cff_api_endpoint} apiKey={config.cff_api_key} />
    </BrowserRouter>
    ,
    formAdminElement
  );
}