import * as React from 'react';
import FormAdminPage from './admin/FormAdminPage';
import FormPage from "./form/FormPage";
import FormStandalone from "./form/FormStandalone/FormStandalone";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import * as queryString from 'query-string';
import "./app.scss";
import * as DOMPurify from 'dompurify';

import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import history from "./history";
import store from "./store";

// Make all external links in form open in a new tab.
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // set all elements owning target to target=_blank
  if ('target' in node) {
    node.setAttribute('target', '_blank');
  }
});

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div className="ccmt-cff-Wrapper-Bootstrap">
        <Switch>
          <Route path="/admin/" render={(props) =>
              <FormAdminPage
                {...props}
                apiKey={null}
              />
          } />
        <Route path="/v2/forms/:formId" exact render={(props) => {
            return (
              <FormStandalone {...props} formId={props.match.params.formId} />
            );
          }
          } />
          <Route path="/:centerSlug/forms/:formId" exact render={(props) => {
            return (
              <FormStandalone {...props} formId={props.match.params.formId} />
            );
          }
          } />
          <Redirect to={`/admin/`} />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>);

export default App;