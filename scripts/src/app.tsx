import * as React from 'react';
import FormAdminPage from './admin/FormAdminPage';
import FormPage from "./form/FormPage";
import FormStandalone from "./form/FormStandalone/FormStandalone";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import * as queryString from 'query-string';
import "./app.scss";
import auth from "./Auth";
import * as DOMPurify from 'dompurify';

import { Provider } from 'react-redux';
import { Reducer, createStore, applyMiddleware } from 'redux';
import { reducers } from './store/index';
import thunkMiddleware from 'redux-thunk'
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history'

// Make all external links in form open in a new tab.
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // set all elements owning target to target=_blank
  if ('target' in node) {
    node.setAttribute('target', '_blank');
  }
});

const history = createBrowserHistory()
const store = createStore(
  connectRouter(history)(reducers),
  applyMiddleware(thunkMiddleware, routerMiddleware(history))
);

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div className="ccmt-cff-Wrapper-Bootstrap">
        <Switch>
          <Route path="/:centerSlug/forms/:formId" exact render={(props) => {
            return (
              <FormStandalone {...props} formId={props.match.params.formId} ENDPOINT_URL={"abcdefg"} />
            );
          }
          } />
          <Route path="/admin/" render={(props) =>
            <div className="App FormAdminPage">
              <FormAdminPage
                {...props}
                apiKey={null}
              />
            </div>
          } />
          <Redirect to={`/admin/`} />
        </Switch>
      </div>
    </ConnectedRouter>
  </Provider>);
export default App;