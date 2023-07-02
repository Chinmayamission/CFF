import React from "react";
import API from "@aws-amplify/api";
import queryString from "query-string";
import sanitize from "../sanitize";
import { get, set, difference, cloneDeep } from "lodash";
import CustomForm from "./CustomForm";
import FormConfirmationPage from "./FormConfirmationPage";
import Loading from "../common/Loading/Loading";
import FormLoader from "../common/FormLoader";
import { connect } from "react-redux";
import { logout } from "../store/auth/actions";
import { Helmet } from "react-helmet";
import htmlToText from "html-to-text";
import Login from "../common/Login/Login";
import {
  IFormPageProps,
  IFormPageState,
  IPaymentInfoReceived
} from "./interfaces";
import { fetchRenderedForm } from "../store/form/actions";
import update from "immutability-helper";
import GoogleFontLoader from "react-google-font-loader";
import { createResponseMetadata } from "../admin/util/responseMetadata";

const STATUS_FORM_LOADING = 0;
const STATUS_FORM_RENDERED = 2;
const STATUS_FORM_CONFIRMATION = 4;
const STATUS_FORM_RESPONSE_VIEW = 3;
const STATUS_FORM_PAYMENT_SUCCESS = 6;
const STATUS_FORM_DONE = 8;

var This;

class FormPage extends React.Component<IFormPageProps, IFormPageState> {
  constructor(props: any) {
    super(props);
    This = this;
    this.state = {
      cff_permissions: {},
      status: STATUS_FORM_LOADING,
      hasError: false,
      errorMessage: "",
      schemaMetadata: {},
      schema: { title: "None", type: "object" },
      uiSchema: { title: "status" },
      formOptions: {},
      step: 0,
      paymentInfo: null,
      paymentMethods: null,
      paymentInfo_received: null,
      paymentCalcInfo: null,
      paymentStarted: false,
      data: null,
      responseId: null,
      ajaxLoading: false,
      predicate: null,
      responseMetadata: {}
    };
  }

  componentDidUpdate(prevProps) {
    // Reload form when logged in.
    if (
      this.props.auth.loggedIn === true &&
      prevProps.auth.loggedIn === false
    ) {
      this.loadForm();
    }
  }
  componentDidCatch(error, info) {
    // Display fallback UI
    error = error.toString();
    if (this.state.hasError) {
      this.setState({
        hasError: true,
        errorMessage:
          this.state.errorMessage + "\n\n" + JSON.stringify(error, null, 2)
      });
    } else {
      this.setState({
        hasError: true,
        errorMessage: JSON.stringify(error, null, 2)
      });
    }

    // You can also log the error to an error reporting service
    console.log("caught");
    console.error(error, info);
  }
  handleError(e) {
    console.error("ERROR", e);
    this.props.logout();
    this.setState({ hasError: true });
  }
  async componentDidMount() {
    await this.loadForm();
  }
  async loadForm() {
    await new Promise((resolve, reject) =>
      this.setState({ status: STATUS_FORM_LOADING }, resolve)
    );
    let {
      schemaMetadata,
      uiSchema,
      schema,
      defaultFormData,
      paymentCalcInfo,
      formOptions,
      cff_permissions
    } = this.props.renderedForm
      ? cloneDeep(this.props.renderedForm)
      : await FormLoader.getFormAndCreateSchemas(
          "",
          this.props.formId,
          "",
          this.props.specifiedShowFields,
          this.props.initialFormData,
          e => this.handleError(e)
        );
    let responseState: any = {};
    if (
      this.props.responseId ||
      this.props.renderedResponse ||
      get(formOptions, "loginRequired") === true
    ) {
      try {
        responseState = await this.loadResponse({
          data: defaultFormData,
          schema,
          formOptions
        });
      } catch (e) {
        console.error(e);
        responseState = {
          hasError: true,
          errorMessage: "Error loading response."
        };
      }
    }
    if (!this.canAdminEdit(cff_permissions)) {
      for (let fieldPath of get(formOptions, "adminFields", [])) {
        set(uiSchema, `${fieldPath}['ui:widget']`, "cff:removed");
        set(uiSchema, `${fieldPath}['ui:field']`, "cff:removed");
        set(uiSchema, `${fieldPath}['classNames']`, "ccmt-cff-removed");
      }
    }
    const { pickFields, extraUiSchema } = this.props;
    let newSchema = schema;
    if (pickFields && pickFields.length) {
      // used in dashboard
      let uiOrder = uiSchema["ui:order"] || [];
      let fieldsToHide = difference(uiOrder, pickFields);
      for (let fieldPath of fieldsToHide) {
        set(uiSchema, `${fieldPath}['ui:widget']`, "cff:removed");
        set(uiSchema, `${fieldPath}['ui:field']`, "cff:removed");
        set(uiSchema, `${fieldPath}['classNames']`, "ccmt-cff-removed");
      }
      newSchema.title = "";
      newSchema.description = "";
    }
    // merge specified uiSchema values into uiSchema (only works for top-level fields now).
    if (extraUiSchema) {
      for (let key in extraUiSchema) {
        uiSchema = {
          ...uiSchema,
          [key]: {
            ...(uiSchema[key] || {}),
            ...extraUiSchema[key]
          }
        };
      }
    }
    let mode = this.props.mode; // can be "view" or "edit"
    if (
      responseState.responseId &&
      !formOptions.loginRequired &&
      !formOptions.responseCanEditByLink &&
      !this.canAdminEdit(cff_permissions)
    ) {
      // if loading a view-only response, default to "view" mode (unless user is an admin)
      mode = "view";
    }
    await new Promise((resolve, reject) =>
      this.setState(
        {
          schemaMetadata,
          uiSchema,
          schema: newSchema,
          status:
            mode === "view" ? STATUS_FORM_RESPONSE_VIEW : STATUS_FORM_RENDERED,
          data: defaultFormData,
          paymentCalcInfo,
          formOptions,
          cff_permissions,
          ...responseState
        },
        resolve
      )
    );
    this.props.onFormLoad &&
      this.props.onFormLoad({
        schema: newSchema,
        uiSchema,
        formOptions,
        cff_permissions,
        responseId: responseState.responseId,
        data: responseState.data
      });
  }
  async loadResponse({ data, schema, formOptions }) {
    let request = this.props.responseId
      ? API.get("CFF", `responses/${this.props.responseId}`, {})
      : API.get("CFF", `forms/${this.props.formId}/response`, {});
    const { res, predicate } = this.props.renderedResponse
      ? cloneDeep(this.props.renderedResponse)
      : await request;
    if (
      get(formOptions, "loginRequired") === true &&
      get(schema, "properties.email") &&
      this.props.auth.loggedIn
    ) {
      if (!res) {
        data = update(data, { email: { $set: this.props.auth.user.email } });
      }
      schema = update(schema, {
        properties: { email: { readOnly: { $set: true } } }
      });
    }
    if (predicate) {
      // TODO: handle payment info.
    }
    return {
      responseId: res && !predicate ? res._id.$oid : null,
      data: res ? res.value : data,
      responseMetadata: res
        ? createResponseMetadata(res)
        : this.state.responseMetadata,
      schema,
      predicate: predicate || (res && res.predicate) // Return either 1) predicate info of a new response that is based on a predicate, or 2) existing predicate info of existing response.
    };
  }
  goBackToFormPage() {
    This.setState({
      status: STATUS_FORM_RENDERED,
      // Don't set response id if we have an anonymous-response form
      // that cannot be edited by link.
      responseId:
        !This.state.loginRequired &&
        !This.state.formOptions.responseCanEditByLink
          ? This.state.responseId
          : null
    });
  }
  onPaymentComplete(e) {
    this.setState({
      status: STATUS_FORM_PAYMENT_SUCCESS
    });
  }
  onSubmit(data: { formData: {} }, submitOptions) {
    let formData = data.formData;
    let payload = {
      data: formData,
      submitOptions,
      modifyLink:
        window.location != window.parent.location
          ? document.referrer
          : window.location.href
    };

    if (this.state.responseId) {
      payload["responseId"] = this.state.responseId;
    }
    this.setState({ ajaxLoading: true });
    API.post("CFF", `forms/${this.props.formId}`, {
      body: payload
    })
      .catch(e => {
        this.setState({ ajaxLoading: false });
        alert("Error submitting the form. " + e);
      })
      .then(response => {
        let res = response.res;
        if (!(res.success == true && res.responseId)) {
          this.setState({ ajaxLoading: false });
          if (res.success == false && res.message) {
            if (res.fields_to_clear && res.fields_to_clear.length) {
              let formDataNew = formData;
              for (let field of res.fields_to_clear) {
                set(formDataNew, field, "");
              }
              this.setState({ data: formDataNew });
            }
            throw "Error submitting the form: " + res.message;
          } else {
            throw "Response not formatted correctly: " + JSON.stringify(res);
          }
        }
        if (this.state.schemaMetadata.showConfirmationPage === false) {
          this.setState({
            ajaxLoading: false,
            status: STATUS_FORM_DONE
          });
          return;
        }
        let newResponse = res.action == "insert";
        let paymentInfo_received: IPaymentInfoReceived = {
          currency: null,
          total: null
        };
        if (!newResponse) {
          // Todo: get paymentInfo_received from server, too, even if it's a new response.
          paymentInfo_received.currency = res.amt_received.currency;
          paymentInfo_received.total = parseFloat(res.amt_received.total);
        }
        if (res.paid) {
          paymentInfo_received.currency = res.paymentInfo.currency;
          paymentInfo_received.total = parseFloat(res.paymentInfo.total);
        }
        this.setState({
          ajaxLoading: false,
          status: STATUS_FORM_CONFIRMATION,
          data: res.value,
          responseId: res.responseId,
          paymentInfo: res.paymentInfo,
          paymentInfo_received: paymentInfo_received,
          paymentMethods: res.paymentMethods
        });

        // Update query string with the new response id, if form allows anonymous submissions.
        if (
          !this.state.formOptions.loginRequired &&
          this.state.formOptions.responseCanViewByLink &&
          history.pushState
        ) {
          const qs = queryString.parse(window.location.search);
          const newurl =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?" +
            queryString.stringify({ ...qs, responseId: res.responseId });
          window.history.pushState({ path: newurl }, "", newurl);
        }

        window.scrollTo(0, 0);
      })
      .catch(err => {
        alert("Error. " + err);
      });
  }
  onPaymentStarted(e) {
    this.setState({ paymentStarted: true });
  }
  onChange(e) {
    this.setState({ data: e.formData });
  }
  // Can the logged-in user currently do an "admin-edit"?
  canAdminEdit(cff_permissions) {
    return (
      get(cff_permissions[this.props.auth.userId] || {}, "Responses_Edit") ===
        true ||
      get(cff_permissions[this.props.auth.userId] || {}, "owner") === true
    );
  }
  renderForm() {
    const hideBar = this.props.pickFields
      ? this.props.pickFields.length > 0
      : false;
    if (this.state.hasError) {
      return (
        <div className="py-2">
          <h1>Unexpected Error</h1>
          <p>
            There was an error loading this form. Please try again later, or
            contact webmaster@chinmayamission.com.
          </p>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }
    if (
      get(this.state.formOptions, "loginRequired") === true &&
      !this.props.auth.loggedIn
    ) {
      return (
        <div className="text-center">
          <h1
            dangerouslySetInnerHTML={{
              __html: sanitize(this.state.schema.title)
            }}
          />
          <h2>Please log in or sign up for a new account.</h2>
          <Login hideBar={hideBar} />
        </div>
      );
    }
    if (this.state.status == STATUS_FORM_PAYMENT_SUCCESS) {
      return (
        <div>
          <h1>Payment processing</h1>
          <p>
            Thank you for your payment! You will receive a confirmation email
            within 24 hours after the payment has been verified.
          </p>
        </div>
      );
    }
    if (this.state.status == STATUS_FORM_DONE) {
      return (
        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitize(
                this.state.schemaMetadata.successMessage ||
                  "Thank you for your form submission!"
              )
            }}
          />
        </div>
      );
    }
    if (this.state.status == STATUS_FORM_LOADING || this.props.loading) {
      return <Loading hasError={this.state.hasError} />;
    }
    if (
      get(this.state.formOptions, "responseSubmissionEnabled", true) === false
    ) {
      return (
        <div className="py-2">
          <h1>Submissions Closed</h1>
          <p>Submissions are closed for this form.</p>
        </div>
      );
    }
    if (
      get(this.state.formOptions, "responseModificationEnabled", true) ===
        false &&
      this.state.status !== STATUS_FORM_CONFIRMATION &&
      this.state.status !== STATUS_FORM_RESPONSE_VIEW &&
      this.state.responseId &&
      !this.canAdminEdit(this.state.cff_permissions)
    ) {
      return (
        <div className="py-2">
          <h1>Response Modifications Closed</h1>
          <p>Response modifications are closed for this form.</p>
        </div>
      );
    }
    let formToReturn = (
      <div
        className={
          (this.props.className || "") +
          (this.state.status == STATUS_FORM_RENDERED
            ? ""
            : " ccmt-cff-Page-FormPage-readonly")
        }
      >
        {this.state.formOptions.loginRequired && <Login hideBar={hideBar} />}
        {!this.state.formOptions.loginRequired && (
          <Login loginOptional={true} hideBar={hideBar} />
        )}
        {this.state.predicate && !this.state.responseId && (
          <div
            className="alert alert-warning"
            dangerouslySetInnerHTML={{
              __html: sanitize(
                get(
                  this.state.formOptions,
                  "predicate.warningText",
                  "Note: This response is imported from one of your previous submissions. Please review the information and update any outdated information as necessary before submitting."
                )
              )
            }}
          />
        )}
        <Helmet>
          <title>
            {htmlToText.fromString(
              get(this.state.schema, "title", "CFF Form"),
              { ignoreImage: true, ignoreHref: true }
            )}
          </title>
        </Helmet>
        <CustomForm
          className={
            get(this.state.formOptions, "theme.sm") === true
              ? "ccmt-cff-Page-FormPage-sm"
              : ""
          }
          showPaymentTable={
            this.state.status == STATUS_FORM_RENDERED ||
            this.state.formOptions.paymentInfo.showPaymentTable === false
          }
          showSubmitOptions={
            false
            // this.canAdminEdit(this.state.cff_permissions) ? true : false
          }
          defaultSubmitOptions={
            this.state.formOptions.defaultSubmitOptions || {}
          }
          schema={this.state.schema}
          uiSchema={this.state.uiSchema}
          formData={this.state.data}
          // TODO: Just pass in a calculate_price function instead of passing in responseMetadata, etc.
          responseMetadata={this.state.responseMetadata}
          paymentCalcInfo={this.state.paymentCalcInfo}
          onSubmit={(e, f) => this.onSubmit(e, f)}
          onChange={e => this.onChange(e)}
          omitExtraData={get(this.state.formOptions, "omitExtraData", false)}
        />
        {this.state.ajaxLoading && <Loading hasError={this.state.hasError} />}
      </div>
    );
    if (this.state.status === STATUS_FORM_CONFIRMATION) {
      const confirmationPageTitle = get(
        this.state.formOptions,
        "messages.confirmationPageTitle",
        "Confirmation Page"
      );
      const confirmationPageNoticeTop = get(
        this.state.formOptions,
        "messages.confirmationPageNoticeTop",
        "Please scroll down and review your registration details in order to continue."
      );
      const readOnlyFormLocation = get(
        this.state.formOptions,
        "theme.confirmationPage.readOnlyFormLocation",
        ""
      );
      return (
        <div>
          {!this.state.paymentStarted && (
            <div>
              {confirmationPageTitle && (
                <h1 className="text-center">{confirmationPageTitle}</h1>
              )}
              {confirmationPageNoticeTop && (
                <div className="alert alert-warning">
                  {confirmationPageNoticeTop}
                </div>
              )}
              {readOnlyFormLocation !== "bottom" && formToReturn}
            </div>
          )}
          <FormConfirmationPage
            onPaymentStarted={e => this.onPaymentStarted(e)}
            schema={this.state.schema}
            schemaMetadata={this.state.schemaMetadata}
            paymentInfo={this.state.paymentInfo}
            paymentInfo_received={this.state.paymentInfo_received}
            paymentMethods={this.state.paymentMethods}
            uiSchema={this.state.uiSchema}
            data={this.state.data}
            goBack={this.goBackToFormPage}
            responseId={this.state.responseId}
            formId={this.props.formId}
            onPaymentComplete={e => this.onPaymentComplete(e)}
            responseMetadata={this.state.responseMetadata}
          />
          {!this.state.paymentStarted &&
            get(this.state.formOptions, "responseModificationEnabled", true) ===
              true && (
              <div className="p-4">
                You can also{" "}
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    this.goBackToFormPage();
                  }}
                >
                  go back and edit your form response
                </a>{" "}
                if you would like to do so.
              </div>
            )}
          {readOnlyFormLocation === "bottom" && formToReturn}
        </div>
      );
    }
    if (this.state.status === STATUS_FORM_RESPONSE_VIEW) {
      return (
        <>
          {this.canAdminEdit(this.state.cff_permissions) &&
            this.state.responseId && (
              <button
                className="btn btn-primary"
                onClick={this.goBackToFormPage}
              >
                Edit
              </button>
            )}
          {formToReturn}
        </>
      );
    }
    return formToReturn;
  }
  render() {
    return (
      <div style={get(this.state.formOptions, "theme.style.root", {})}>
        <style
          dangerouslySetInnerHTML={{
            __html: get(this.state.formOptions, "theme.style.rootRaw", "")
          }}
        />
        <GoogleFontLoader
          fonts={get(this.state.formOptions, "theme.fonts", [])}
        />
        {this.renderForm()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ...state.form,
  auth: state.auth
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchRenderedForm: formId => dispatch(fetchRenderedForm(formId)),
  logout: () => dispatch(logout())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormPage);
