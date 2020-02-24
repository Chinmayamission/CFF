import React, { useEffect, useState } from "react";
import "./FormDashboard.scss";
import FormPage from "../../form/FormPage";
import * as queryString from "query-string";
import { connect } from "react-redux";
import { fetchRenderedForm } from "../../store/form/actions";
import Loading from "../../common/Loading/Loading";
import Login from "../../common/Login/Login";
import { LoginBlurb } from "../../admin/FormAdminPage";
import classnames from "classnames";

const Nav = ({ views, onSelect, selectedView }) => (
  <ul className="nav nav-pills">
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
  // let qs = queryString.parse(props.location.search);
  useEffect(() => {
    props.fetchRenderedForm(formId);
  }, []);
  const [selectedView, setView] = useState({});
  if (!props.auth.loggedIn) {
    return (
      <>
        <LoginBlurb />
        <Login />
      </>
    );
  }
  if (!form || !form.renderedForm) {
    return <Loading />;
  }
  const { formOptions } = form.renderedForm;
  const { dataOptions } = formOptions;
  return (
    <div>
      <Login />
      <Nav
        views={dataOptions.views}
        onSelect={e => setView(e)}
        selectedView={selectedView}
      />
    </div>
  );
  //   return (
  //     <div className="App ccmt-cff-page-form">
  //       <div className="container ccmt-cff-paper-outline">
  //         {/* <FormPage
  //                     formId={formId}
  //                     responseId={qs.responseId}
  //                     mode={"view"}
  //                     onFormLoad={e => console.log(e)}
  //                     specifiedShowFields={JSON.parse(
  //                         (qs && qs["specifiedShowFields"]) || "{}"
  //                     )}
  //                     className="p-4"
  //                 /> */}
  //       </div>
  //     </div>
  //   );
};

const mapStateToProps = state => ({
  form: state.form,
  auth: state.auth
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchRenderedForm: formId => dispatch(fetchRenderedForm(formId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormDashboard);
