import React, { useEffect, useState } from "react";
import "./FormDashboard.scss";
import FormPage from "../../form/FormPage";
import * as queryString from "query-string";
import { connect } from "react-redux";
import {
  fetchRenderedForm,
  fetchRenderedResponse
} from "../../store/form/actions";
import Loading from "../../common/Loading/Loading";
import Login from "../../common/Login/Login";
import { LoginBlurb } from "../../admin/FormAdminPage";
import classnames from "classnames";
import { Template } from "../../sanitize";
import "../form.scss";

// Nav pills on top of screen.
const Nav = ({ views, onSelect, selectedView }) => (
  <ul className="nav nav-pills mt-4">
    {views.map(e => (
      <li className="nav-item btn-outline-primary" key={e.id}>
        <a
          className={classnames("nav-link", {
            active: selectedView.id === e.id
          })}
          onClick={() => onSelect(e)}
        >
          {e.displayName}
        </a>
      </li>
    ))}
  </ul>
);

const FormDashboard = props => {
  const { form, formId } = props;
  let qs = queryString.parse(props.location.search);
  useEffect(() => {
    props.fetchRenderedForm(formId);
  }, []);
  useEffect(() => {
    if (props.auth.loggedIn) {
      // dashboard available to logged-in users only, for now.
      props.fetchRenderedResponse({ formId, responseId: qs.responseId });
    }
  }, [props.auth.loggedIn]);
  const [selectedView_, setView] = useState(null);
  if (!props.auth.loggedIn) {
    return (
      <>
        <LoginBlurb />
        <Login />
      </>
    );
  }
  if (!form || !form.renderedForm || !form.renderedResponse) {
    return <Loading />;
  }
  const { renderedForm, renderedResponse } = form;
  const { formOptions } = form.renderedForm;
  let { dashboardOptions } = formOptions;
  if (!dashboardOptions) {
    dashboardOptions = {
      views: []
    };
  }
  let selectedView =
    selectedView_ ||
    (dashboardOptions.views.length > 0 ? dashboardOptions.views[0] : {}); // default to first view, if present
  return (
    <div>
      <Login />
      {dashboardOptions.header && (
        <Template template={dashboardOptions.header} context={{}} />
      )}
      <Nav
        views={dashboardOptions.views}
        onSelect={e => setView(e)}
        selectedView={selectedView}
      />
      {selectedView.type === "form" && (
        <FormPage
          key={selectedView.id}
          formId={formId}
          mode={"edit"}
          onFormLoad={e => console.log(e)}
          pickFields={selectedView.pickFields}
          renderedForm={renderedForm}
          renderedResponse={renderedResponse}
          className="p-4"
        />
      )}
      {selectedView.type === "template" && (
        <Template
          key={selectedView.id}
          template={selectedView.template.html}
          context={renderedResponse.res}
        />
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  form: state.form,
  auth: state.auth
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchRenderedForm: formId => dispatch(fetchRenderedForm(formId)),
  fetchRenderedResponse: formId => dispatch(fetchRenderedResponse(formId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormDashboard);
