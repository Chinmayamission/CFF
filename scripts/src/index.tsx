import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './form/FormPage';
import FormAdminPage from './admin/FormAdminPage';
import { BrowserRouter } from 'react-router-dom';
import "./common/main.css";


let config = {
  "cff_api_endpoint": 'https://l5nrf4co1g.execute-api.us-east-1.amazonaws.com/prod/forms'
};

let formRenderElement = document.getElementById('ccmt-cff-render') as HTMLElement;
if (formRenderElement) {
  ReactDOM.render(
    <div className="">
    <FormPage formId={{"$oid":formRenderElement.getAttribute('data-form-id')}} apiEndpoint={config.cff_api_endpoint} />
    </div>
    ,
    formRenderElement
  );
}

let formAdminElement = document.getElementById('ccmt-cff-admin') as HTMLElement;
if (formAdminElement) {
  ReactDOM.render(
    <div className="">
      <FormAdminPage apiEndpoint={config.cff_api_endpoint} apiKey={"5a2g9ecdf21d076gee1157b1" || formAdminElement.getAttribute('data-api-key')} />
    </div>
    ,
    formAdminElement
  );
}