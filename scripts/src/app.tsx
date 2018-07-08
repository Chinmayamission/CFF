import * as React from 'react';
import FormAdminPage from './admin/FormAdminPage';
import FormPage from "./form/FormPage";
import FormStandalone from "./form/FormStandalone/FormStandalone";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import * as queryString from 'query-string';
import "./app.scss";
import * as DOMPurify from 'dompurify';
import Loading from "src/common/Loading/Loading";

import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import history from "./history";
import { IBaseState } from "./store/base/types";

// Make all external links in form open in a new tab.
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // set all elements owning target to target=_blank
  if ('target' in node) {
    node.setAttribute('target', '_blank');
  }
});


const mapStateToProps = state => ({
  ...state.base
});

const mapDispatchToProps = (dispatch, ownProps) => ({

});

const App = (props: IBaseState) => (
  <ConnectedRouter history={history}>
    <div className="ccmt-cff-Wrapper-Bootstrap">
      {props.loading && <Loading />}
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
  </ConnectedRouter>);

export default connect(mapStateToProps, mapDispatchToProps)(App);