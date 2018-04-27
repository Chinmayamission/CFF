import Config from "./index";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FormAdminPage from './admin/FormAdminPage';
import FormPage from "./form/FormPage";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import * as queryString from 'query-string';

import "./form.tsx";

let formAdminElement = document.getElementById('ccmt-cff-main') as HTMLElement;
if (formAdminElement) {
  ReactDOM.render(
    <div className="ccmt-cff-Wrapper-Bootstrap">
      <Router>
        <Switch>
          <Route path="/forms/:formId" exact render={(props) => {
            let qs = queryString.parse(props.location.search);
            return <FormPage formId={props.match.params.formId}
              authKey={null}
              specifiedShowFields={JSON.parse((qs && qs["specifiedShowFields"]) || "{}")}
              apiEndpoint={Config.ENDPOINT_URL} />
          }
          } />
          <Route path="/admin/" exact render={(props) =>
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