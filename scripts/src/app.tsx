import Config from "./index";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FormAdminPage from './admin/FormAdminPage';
// import FormPage from "./form/FormPage";

import "./form.tsx";

let formAdminElement = document.getElementById('ccmt-cff-admin') as HTMLElement;
if (formAdminElement) {
  ReactDOM.render(
    <div className="ccmt-cff-Wrapper-Bootstrap">
      <FormAdminPage
        apiEndpoint={Config.ENDPOINT_URL}
        apiKey={formAdminElement.getAttribute('data-ccmt-cff-api-key')}
        federated={Config.federated}
        />
    </div>,
    formAdminElement
  );

}