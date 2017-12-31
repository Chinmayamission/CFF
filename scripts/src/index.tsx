/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import FormPage from './FormPage';
// import './index.css';

var rootElement = document.getElementById('gcmw-cff-root') as HTMLElement;
ReactDOM.render(
  <FormPage formId={rootElement.getAttribute('data-form-id')} />,
  rootElement
);