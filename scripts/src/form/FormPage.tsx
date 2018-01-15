/// <reference path="./interfaces.d.ts"/>
import axios from 'axios';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Form from 'react-jsonschema-form';
import SchemaField from "react-jsonschema-form";
import TitleField from "react-jsonschema-form";
import DescriptionField from "react-jsonschema-form";
import * as DOMPurify from 'dompurify';
import * as queryString from "query-string";
import { pick } from "lodash-es";
import "./form.scss";
import FormConfirmationPage from "./FormConfirmationPage";
import Loading from "src/common/loading";
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";

const STATUS_FORM_LOADING = 0;
const STATUS_FORM_RENDERED = 2;
const STATUS_FORM_CONFIRMATION = 4;
const STATUS_FORM_PAYMENT_SUCCESS = 6;

/* Custom object field template that allows for grid classes to be specified.
 * If no className is given in schema modifier, defaults to "col-12".
 */
function ObjectFieldTemplate({ TitleField, properties, title, description }) {
  return (
    <div className="container-fluid p-0">
      <TitleField title={title} />
      <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(description) }} />
      <div className="row">
        {properties.map(prop => {
          let customClasses = {
            "twoColumn": "col-xs-12 col-sm-6",
            "threeColumn": "col-xs-12 col-sm-4",
            "fourColumn": "col-xs-6 col-sm-3",
            "fiveColumn": "col-xs-6 col-sm-2",
            "sixColumn": "col-xs-6 col-sm-2",
            "flex": "col-xs-6",
            "full": "col-xs-12"
          };
          if (!prop.content.props.uiSchema.classNames) {
            prop.content.props.uiSchema.classNames = "col-xs-12";
          }
          for (let customClass in customClasses) {
            prop.content.props.uiSchema.classNames = prop.content.props.uiSchema.classNames.replace(customClass, customClasses[customClass]);
          }
          return (prop.content);
        })}
      </div>
    </div>
  );
}

/* Adds a custom error message for regex validation (especially for phone numbers).
 */
function transformErrors(errors) {
  return errors.map(error => {
    if (error.name === "pattern") {
      error.message = "Please enter a value in the correct format."
    }
    return error;
  });
}


const PhoneWidget = (props: any) => {
  return (
    <input
      type="tel"
      className="inputPhone"
      value={props.value}
      required={props.required}
      onChange={(event) => props.onChange(event.target.value)}
    />
  );
};


const FormattedDescriptionField = ({ id, description }) => {
  return <div id={id}>
    <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(description) }} />
  </div>;
};

const CustomTitleField = ({ title, required }) => {
  if (!title || !title.trim()) {
    return <span />;
  }
  const legend = required ? title + '*' : title;
  return <h2 className="ccmt-cff-form-title">
    {legend}
  </h2>;
};

function ErrorListTemplate(props) {
  const { errors } = props;
  return (
    <div className="ccmt-cff-errorList">
      <b>Errors:</b>
      {errors.map((error, i) => {
        return (
          <li key={i}>
            {error.stack}
          </li>
        );
      })}
    </div>
  );
};


const widgets = {
  phone: PhoneWidget
};

const fields = {
  DescriptionField: FormattedDescriptionField,
  rawDescription: (e) => { console.warn("A" + e) },
  TitleField: CustomTitleField
};

const schema = {};

const uiSchema = {};

var This;
//const log = (type: {}) => console.log.bind(console, type);
const log = console.log;

class FormPage extends React.Component<IFormPageProps, IFormPageState> {

  constructor(props: any) {
    super(props);
    This = this;
    this.state = {
      status: STATUS_FORM_LOADING,
      hasError: false,
      schemaMetadata: {},
      schema: { "title": "None", "type": "object" },
      uiSchema: { "title": "status" },
      step: 0,
      paymentInfo: null,
      paymentInfo_received: null,
      data: null,
      responseId: null,
      responseLoaded: null
    };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    console.log("caught");
    console.error(error, info);
  }

  getFormSubmitUrl() {
    let formId = this.props.formId;
    let formUrl = this.props.apiEndpoint + "?action=" + "formSubmit" + "&formVersion=1&formId=" + formId;
    if (this.state.responseId) {
      console.log("yes");
      formUrl += "&resid=" + this.state.responseId;
    }
    formUrl += "&modifyLink=" + window.location.href;
    return encodeURI(formUrl);
  }
  scrollToTop() {
    ReactDOM.findDOMNode(this).scrollIntoView();
  }

  componentDidUpdate(prevProps, prevState) {
    let stateKeysToEncode = ["status", "responseId"];
    if (pick(this.state, stateKeysToEncode) != pick(prevState, stateKeysToEncode)) {
      let encodedState = pick(this.state, stateKeysToEncode);
      let newQS = queryString.stringify(encodedState);
      window.location.hash = newQS;//queryString.stringify(encodedState);  
      this.scrollToTop();
    }
  }
  handleError(e) {
    console.error("ERROR", e);
    this.setState({"hasError": true});
  }

  componentDidMount() {
    let queryObjFlat = queryString.parse(location.hash);
    if (queryObjFlat["payment_success"] == "1") {
      this.setState({"status": STATUS_FORM_PAYMENT_SUCCESS});
    }
    else if (queryObjFlat["responseId"]) {
      FormLoader.loadResponseAndCreateSchemas(this.props.apiEndpoint, this.props.formId, queryObjFlat["responseId"], (e) => this.handleError(e)).then(({ schemaMetadata, uiSchema, schema, responseLoaded }) => {
        this.setState({ schemaMetadata, uiSchema, schema, responseId: responseLoaded["responseId"], responseLoaded: responseLoaded, data: responseLoaded ? responseLoaded.value : null, status: STATUS_FORM_RENDERED });
      });
    }
    else {
      if ((window as any).CCMT_CFF_DEVMODE_AUTOFILL == true) {
        this.setState({data: MockData.sampleData});
      }
      FormLoader.getFormAndCreateSchemas(this.props.apiEndpoint, this.props.formId, (e) => this.handleError(e)).then(({ schemaMetadata, uiSchema, schema }) => {
        this.setState({ schemaMetadata, uiSchema, schema, status: STATUS_FORM_RENDERED });
      });
    }

  }
  goBackToFormPage() {
    This.setState({ status: STATUS_FORM_RENDERED });
  }
  onPaymentComplete(e) {
    this.setState({
      "status": STATUS_FORM_PAYMENT_SUCCESS
    });
  }
  onSubmit(data: { formData: {} }) {
    var formData = data.formData;
    var instance = axios.create({
      headers: {
        "Content-Type": "application/json"
      }
    });
    instance.post(this.getFormSubmitUrl(), formData).catch(e => {
      if ((window as any).CCMT_CFF_DEVMODE === true) {
        return MockData.newResponse();
      }
      alert("Error loading the form list. " + e);
    }).then((response) => {
      let res = response.data.res;
      if (!(res.success == true && res.id)) {
        throw "Response not formatted correctly: " + JSON.stringify(res);
      }
      let newResponse = res.action == "insert";
      this.setState({
        status: STATUS_FORM_CONFIRMATION,
        data: formData,
        responseId: res.id,
        paymentInfo: res.paymentInfo,
        paymentInfo_received: newResponse ? null : {"currency": "USD", "total": res.total_amt_received }
        // todo: don't hardcode currency.
      });
    }).catch((err) => {
      alert("Error. " + err);
    });
  }
  render() {
    if (this.state.status == STATUS_FORM_PAYMENT_SUCCESS) {
      return (<div>
        <h1>Payment processing</h1>
        <p>Thank you for your payment! You will receive a confirmation email within 24 hours after the payment has been verified.</p>
      </div>);
    }
    if (this.state.status == STATUS_FORM_LOADING) {
      return (
        <Loading hasError={this.state.hasError} />
      );
    } // else if (this.state.status == STATUS_FORM_RENDERED) {
    let formToReturn = (
      <div className={"ccmt-cff-Page-FormPage " + ((this.state.status == STATUS_FORM_RENDERED) ? "" : "ccmt-cff-Page-FormPage-readonly")} >
        <Form
          schema={this.state.schema}
          uiSchema={this.state.uiSchema}
          formData={this.state.data}
          widgets={widgets}
          fields={fields}
          ObjectFieldTemplate={ObjectFieldTemplate}
          transformErrors={transformErrors}
          onChange={() => {null}}
          onSubmit={(e) => this.onSubmit(e)}
          onError={(e) => this.scrollToTop()}
          showErrorList={true}
          ErrorList={ErrorListTemplate}
        >
          <button className="btn btn-primary btn-lg" type="submit">Submit</button>
        </Form>
      </div>
    );
    if (this.state.status == STATUS_FORM_CONFIRMATION) {
      formToReturn =
        (<div>
          <h1>Confirmation Page</h1>
          <button className="btn"
            onClick={this.goBackToFormPage}
          >Go back and edit form response</button>
          {formToReturn}
          <button className="btn"
            onClick={this.goBackToFormPage}
          >Go back and edit form response</button>
          <FormConfirmationPage
            apiEndpoint={this.props.apiEndpoint}
            schema={this.state.schema}
            schemaMetadata={this.state.schemaMetadata}
            paymentInfo={this.state.paymentInfo}
            paymentInfo_received={this.state.paymentInfo_received}
            uiSchema={this.state.uiSchema}
            data={this.state.data}
            goBack={this.goBackToFormPage}
            responseId={this.state.responseId}
            formId={this.props.formId}
            onPaymentComplete={(e) => this.onPaymentComplete(e)}
          />
        </div>);
    }
    return formToReturn;
  }
}

export default FormPage;