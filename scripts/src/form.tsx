import Config from "./index";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FormPage from './form/FormPage';


let formRenderElement = document.getElementById('ccmt-cff-render') as HTMLElement;
if (formRenderElement) {
  ReactDOM.render(
    <div className="ccmt-cff-Wrapper-Bootstrap">
      <FormPage formId={formRenderElement.getAttribute('data-ccmt-cff-form-id')}
        authKey={formRenderElement.getAttribute('data-ccmt-cff-auth-key')}
        specifiedShowFields={JSON.parse((formRenderElement.getAttribute('data-ccmt-cff-specified-show-fields')))}
        apiEndpoint={Config.ENDPOINT_URL} />
    </div>
    ,
    formRenderElement
  );
}