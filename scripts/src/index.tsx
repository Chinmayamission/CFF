import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './form/FormPage';
import FormAdminPage from './admin/FormAdminPage';
import { BrowserRouter } from 'react-router-dom';
import "./common/main.css";


// dev apiEndpoint https://l5nrf4co1g.execute-api.us-east-1.amazonaws.com/dev/forms
// dev apiKey test

(window as any).CCMT_CFF_DEVMODE = false;

let formRenderElement = document.getElementById('ccmt-cff-render') as HTMLElement;
if (formRenderElement) {
  ReactDOM.render(
    <div className="">
    <FormPage formId={{"$oid":formRenderElement.getAttribute('data-ccmt-cff-form-id')}} apiEndpoint={formRenderElement.getAttribute('data-ccmt-cff-api-endpoint')} />
    </div>
    ,
    formRenderElement
  );
}

let formAdminElement = document.getElementById('ccmt-cff-admin') as HTMLElement;
if (formAdminElement) {
  ReactDOM.render(
    <div className="">
      <FormAdminPage apiEndpoint={formAdminElement.getAttribute('data-ccmt-cff-api-endpoint')} apiKey={formAdminElement.getAttribute('data-ccmt-cff-api-key')} />
    </div>
    ,
    formAdminElement
  );
}