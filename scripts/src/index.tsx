import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './form/FormPage';
import FormAdminPage from './admin/FormAdminPage';
import { BrowserRouter } from 'react-router-dom';
import "./common/main.scss";
import * as DOMPurify from 'dompurify';


// dev apiEndpoint https://l5nrf4co1g.execute-api.us-east-1.amazonaws.com/dev/forms
// dev apiKey test

(window as any).CCMT_CFF_DEVMODE = false;
(window as any).CCMT_CFF_DEVMODE_AUTOFILL = false;


// Make all external links in form open in a new tab.
DOMPurify.addHook('afterSanitizeAttributes', function(node) {
  // set all elements owning target to target=_blank
  if ('target' in node) {
      node.setAttribute('target','_blank');
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
      <FormAdminPage apiEndpoint={formAdminElement.getAttribute('data-ccmt-cff-api-endpoint')} apiKey={formAdminElement.getAttribute('data-ccmt-cff-api-key')} />
    </div>
    ,
    formAdminElement
  );
}