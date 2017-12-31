/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './form/FormPage';
import FormAdminPage from './admin/FormAdminPage';
// import './index.css';

let formRenderElement = document.getElementById('gcmw-cff-render') as HTMLElement;
if (formRenderElement) {
  ReactDOM.render(
    <FormPage formId={formRenderElement.getAttribute('data-form-id')} />,
    formRenderElement
  );
}

let formAdminElement = document.getElementById('gcmw-cff-admin') as HTMLElement;
if (formAdminElement) {
  ReactDOM.render(
    <FormAdminPage />,
    formAdminElement
  );
}