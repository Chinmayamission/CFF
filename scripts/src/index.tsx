import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './form/FormPage';
import FormAdminPage from './admin/FormAdminPage';
import { BrowserRouter } from 'react-router-dom';


let config = {
  "cff_api_endpoint": 'https://l5nrf4co1g.execute-api.us-east-1.amazonaws.com/prod/forms'
};

let formRenderElement = document.getElementById('ccmt-cff-render') as HTMLElement;
if (formRenderElement) {
  ReactDOM.render(
    <div className="bootstrap">
    <FormPage formId={{"$oid":formRenderElement.getAttribute('data-form-id')}} apiEndpoint={config.cff_api_endpoint} />
    </div>
    ,
    formRenderElement
  );
}

let formAdminElement = document.getElementById('ccmt-cff-admin') as HTMLElement;
if (formAdminElement) {
  ReactDOM.render(
    <div className="bootstrap">
      <FormAdminPage apiEndpoint={config.cff_api_endpoint} apiKey={"test" || formAdminElement.getAttribute('data-api-key')} />
    </div>
    ,
    formAdminElement
  );
}