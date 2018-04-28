import Config from "./index";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FormAdminPage from './admin/FormAdminPage';
import FormPage from "./form/FormPage";
import FormStandalone from "./form/FormStandalone/FormStandalone";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import * as queryString from 'query-string';
import "./app.scss";
import "./form.tsx";


let formAdminElement = document.getElementById('ccmt-cff-main') as HTMLElement;
if (true || formAdminElement) {
  ReactDOM.render(
    <div className="ccmt-cff-Wrapper-Bootstrap">
      <Router>
        <Switch>
          <Route path="/forms/:centerSlug/:formId" exact render={(props) => {
            return (
              <FormStandalone {...props} formId={props.match.params.formId} ENDPOINT_URL={Config.ENDPOINT_URL} />
            );
          }
          } />
          <Route path="/admin/" render={(props) =>
            <div className="App FormAdminPage">
              <FormAdminPage
                {...props}
                apiEndpoint={Config.ENDPOINT_URL}
                apiKey={null}
                federated={Config.federated}
              />
            </div>
          } />
          <Redirect to={`/admin/`} />
        </Switch>
      </Router>

    </div>,
    formAdminElement
  );

}