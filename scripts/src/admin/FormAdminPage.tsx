import * as React from "react";
import FormList from "./FormList/FormList";
import FormEdit from "./FormEdit/FormEdit";
import ResponseTable from "./ResponseTable/ResponseTable";
import FormShare from "./FormShare/FormShare";
import Loading from "../common/Loading/Loading";
import "./admin.scss";
import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import Login from "../common/Login/Login";
import { IFormAdminPageProps, IFormAdminPageState } from "./admin";
import FormCheckin from "./FormCheckin/FormCheckin";
import FormPageMenu from "./FormPageMenu";

declare var VERSION: string;
const STATUS_LOADING = 0;
const STATUS_ERROR = 11;
const STATUS_ACCESS_DENIED = 21;
const STATUS_CENTER_LIST = 31;

export const LoginBlurb = () => (
  <div style={{ textAlign: "center" }}>
    <img
      style={{ maxHeight: 200, marginBottom: 20 }}
      src={require("../img/logo.png")}
    />
    <h3 className="mb-4">
      Please log in to your <br />
      <strong>Chinmaya Mission Account</strong>
      <br />
    </h3>
  </div>
);

class FormAdminPage extends React.Component<
  IFormAdminPageProps,
  IFormAdminPageState
> {
  constructor(props: any) {
    super(props);
    this.render = this.render.bind(this);
    this.state = {
      centerList: [],
      formList: [],
      center: null,
      selectedForm: null,
      status: STATUS_LOADING,
      hasError: false,
      errorMessage: "",
      user: { id: "", name: "", email: "" },
      apiKey: null,
      loading: false
    };
  }
  componentDidMount() {
    // this.loadCenters();
  }
  loadCenters() {
    this.setState({ status: STATUS_CENTER_LIST });
  }
  handleError(e) {
    console.error(e);
    this.setState({ hasError: true });
  }
  componentDidCatch(error, info) {
    // Display fallback UI
    console.error("ERROR", error);
    this.setState({ status: STATUS_ACCESS_DENIED, hasError: true });
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
  }
  onUnauth(error) {
    console.warn(error);
    this.setState({ status: STATUS_ACCESS_DENIED, hasError: true });
    // throw error;
  }
  onError(error) {
    this.onLoadEnd();
    this.setState({ hasError: true });
    // if (error == "No credentials") {

    // }
    alert(error);
  }
  onLoadStart(e = null) {
    this.setState({ loading: true });
  }
  onLoadEnd(e = null) {
    this.setState({ loading: false });
  }
  render() {
    if (this.state.status == STATUS_ACCESS_DENIED) {
      return <AccessDenied userId={this.state.user.id} />;
    }
    if (this.state.hasError) {
      return <Loading hasError={true} />;
    }
    return (
      <div className="App FormAdminPage">
        <Route
          path="/admin/:formId"
          render={props => (
            <FormPageMenu
              formId={props.match.params.formId}
              ItemComponent={props => (
                <button className="btn btn-sm btn-outline-primary">
                  {props.children}
                </button>
              )}
            />
          )}
        />
        <Route path="/admin/:formId" component={FormPages} />
        <Switch>
          <Route
            path="/admin/"
            exact
            render={props => (
              <FormList onError={e => this.onError(e)} {...props} />
            )}
          />
        </Switch>
      </div>
    );
  }
}
function FormPages() {
  return (
    <Switch>
      {/* <Route path='/admin/:formId/responses' exact render={({ match, location }) =>
            <Redirect to={{ pathname: `/admin/${match.params.formId}/responses/` }} />} /> */}
      {/* <Route path="/admin/:formId/responses/:tableViewName" render={props =>
            <ResponseTable selectedForm={null} key={props.match.params.formId} editMode={false} onError={e => this.onError(e)} {...props} />
        } /> */}
      <Route
        path="/admin/:formId/responses/"
        strict
        render={props => (
          <ResponseTable
            selectedForm={null}
            key={props.match.params.formId}
            onError={e => this.onError(e)}
            {...props}
          />
        )}
      />
      <Route
        path="/admin/:formId/edit/"
        render={props => (
          <FormEdit
            formId={props.match.params.formId}
            key={props.match.params.formId}
            onError={e => this.onError(e)}
            {...props}
          />
        )}
      />
      <Route
        path="/admin/:formId/checkin/"
        render={props => (
          <FormCheckin
            key={props.match.params.formId}
            checkinMode={true}
            editMode={false}
            onError={e => this.onError(e)}
            {...props}
          />
        )}
      />
      <Route
        path="/admin/:formId/share/"
        render={props => (
          <FormShare
            key={props.match.params.formId}
            onError={e => this.onError(e)}
            {...props}
          />
        )}
      />
      <Route
        path="/admin/org/:orgId/share/"
        render={props => (
          <FormShare
            org={true}
            key={props.match.params.formId}
            onError={e => this.onError(e)}
            {...props}
          />
        )}
      />
    </Switch>
  );
}
function AccessDenied(props) {
  return (
    <div>
      <h4>
        <b>Error</b>
      </h4>
      <p>
        There was an unknown error. Please contact itsupport@chinmayamission.com
        to get help with this issue.
      </p>
    </div>
  );
}

interface IFormAdminPageWrapperProps {
  loggedIn: boolean;
}

const mapStateToProps = state => ({
  ...state.auth
});

const mapDispatchToProps = (dispatch, ownProps) => ({});
const FormAdminPageWrapper = (props: IFormAdminPageWrapperProps) => {
  return (
    <div>
      <div className="col-12 text-center">
        {!props.loggedIn && <LoginBlurb />}
        <Login linkToHome />
      </div>
      <hr />
      {props.loggedIn && <FormAdminPage />}
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormAdminPageWrapper);
