import * as React from "react";
import FormAdminPage from "./admin/FormAdminPage";
import FormStandalone from "./form/FormStandalone/FormStandalone";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import "./app.scss";
import Loading from "./common/Loading/Loading";

import { connect } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import history from "./history";
import { IBaseState } from "./store/base/types";
import WordpressLoginForm from "./common/Login/WordpressLoginForm/WordpressLoginForm";
import * as DOMPurify from "dompurify";

// Make all external links in form open in a new tab.
DOMPurify.addHook("afterSanitizeAttributes", function(node) {
  // set all elements owning target to target=_blank
  if ("target" in node) {
    node.setAttribute("target", "_blank");
  }
});

const mapStateToProps = state => ({
  ...state.base
});

const mapDispatchToProps = (dispatch, ownProps) => ({});

interface AppProps extends IBaseState {}

const App = (props: AppProps) => (
  <ConnectedRouter history={history}>
    <div className={props.bootstrap ? "ccmt-cff-Wrapper-Bootstrap" : ""}>
      {props.loading && <Loading />}
      <Switch>
        <Route
          path="/login-forms/wp/register"
          render={() => <WordpressLoginForm authPage={"signUp"} />}
        />
        <Route
          path="/login-forms/wp/lostpassword"
          render={() => <WordpressLoginForm authPage={"forgotPassword"} />}
        />
        <Route
          path="/admin/"
          render={props => <FormAdminPage {...props} apiKey={null} />}
        />
        <Route
          path="/v2/forms/:formId"
          exact
          render={props => {
            return (
              <FormStandalone {...props} formId={props.match.params.formId} />
            );
          }}
        />
        <Route
          path="/:centerSlug/forms/:formId"
          exact
          render={props => {
            return (
              <FormStandalone {...props} formId={props.match.params.formId} />
            );
          }}
        />
        <Redirect to={`/admin/`} />
      </Switch>
    </div>
  </ConnectedRouter>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
