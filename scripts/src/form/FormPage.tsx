/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import Form from 'react-jsonschema-form';
import SchemaField from "react-jsonschema-form";
import TitleField from "react-jsonschema-form";
import DescriptionField from "react-jsonschema-form";
import BooleanField from 'react-jsonschema-form';
import * as DOMPurify from 'dompurify';
import * as Promise from 'bluebird';
import axios from 'axios';
import "./form.css";
import FormConfirmationPage from "./FormConfirmationPage";
import Loading from "src/common/loading";
import FormLoader from "src/common/FormLoader";

const STATUS_FORM_LOADING = 0;
const STATUS_FORM_RENDERED = 2;
const STATUS_FORM_SUBMITTED = 4;

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
          if (prop.content.props.uiSchema.classNames == "twoColumn") {
            prop.content.props.uiSchema.classNames = "col-12 col-sm-6";
          }
          if (!prop.content.props.uiSchema.classNames) {
            prop.content.props.uiSchema.classNames = "col-12";
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

const TCWidget = (props: any) => {
  return (
    <div>
      <div>I agree to the <a target="_blank" href={props.link}>Terms and Conditions</a>.</div>
      <input
        type="checkbox"
        value={props.value}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
};


const FormattedDescriptionField = ({ id, description }) => {
  return <div id={id}>
    <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(description) }} />
  </div>;
};

const CustomBooleanField = (props => {
  console.log("p", props);
  return (<div>
    <FormattedDescriptionField id={props.description} description={props.description} />
    <BooleanField {...props} />
  </div>);
})

const CustomTitleField = ({ title, required }) => {
  const legend = required ? title + '*' : title;
  return <h2 className="ccmt-cff-form-title">
    {legend && legend.replace(/\b[a-z]/g, l => l.toUpperCase())}
  </h2>;
};


const widgets = {
  phone: PhoneWidget,
  "tc": TCWidget
};

const fields = {
  DescriptionField: FormattedDescriptionField,
  rawDescription: (e) => { console.log("A" + e) },
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
      schemaMetadata: {},
      schema: { "title": "None", "type": "object" },
      uiSchema: { "title": "status" },
      step: 0,
      data: {
        "name": {
          "first": "Ashwin",
          "last": "Ramaswami"
        },
        "additionalParticipants": [
          {
            "name": {
              "first": "Kalyani",
              "last": "Sank"
            }
          },
          {
            "name": {
              "first": "Arvind",
              "last": "Ramaswami"
            }
          }
        ],
        "email": "aramaswamis@gmail.com",
        "acceptTerms": true,
        "address": { "zipcode": "30022" },
        "race": "10K"
      },
      responseId: null
    };
  }

  getFormUrl(action) {
    let formId = this.props.formId['$oid'];
    return this.props.apiEndpoint + "?action=" + action + "&id=" + formId;
  }

  componentDidMount() {
    let formLoader = new FormLoader();
    formLoader.getFormAndCreateSchemas(this.props.apiEndpoint, this.props.formId['$oid']).then(({ schemaMetadata, uiSchema, schema }) => {
      this.setState({ schemaMetadata, uiSchema, schema, status: STATUS_FORM_RENDERED });
    });

  }
  goBackToFormPage() {
    This.setState({ status: STATUS_FORM_RENDERED });
  }
  onSubmit(data: { formData: {} }) {
    var formData = data.formData;
    var instance = axios.create({
      headers: {
        "Content-Type": "application/json"
      }
    });
    instance.post(this.getFormUrl("formSubmit"), formData).then((response) => {
      let res = response.data.res;
      if (!(res.success == true && res.inserted_id["$oid"])) {
        throw "Response not formatted correctly: " + JSON.stringify(res);
      }
      this.setState({ status: STATUS_FORM_SUBMITTED, data: formData, responseId: res.inserted_id });
    }).catch((err) => {
      alert("Error. " + err);
    });
  }
  render() {
    if (this.state.status == STATUS_FORM_LOADING) {
      return (
        <Loading />
      );
    } else if (this.state.status == STATUS_FORM_RENDERED) {
      return (
        <div className="App">
          <Form
            schema={this.state.schema}
            uiSchema={this.state.uiSchema}
            formData={this.state.data}
            widgets={widgets}
            fields={fields}
            ObjectFieldTemplate={ObjectFieldTemplate}
            transformErrors={transformErrors}
            onChange={() => log('changed')}
            onSubmit={(e) => this.onSubmit(e)}
            onError={() => log('errors')}
          />
        </div>
      );
    }
    else if (this.state.status == STATUS_FORM_SUBMITTED) {
      return (<FormConfirmationPage
        schema={this.state.schema}
        schemaMetadata={this.state.schemaMetadata}
        uiSchema={this.state.uiSchema}
        data={this.state.data}
        goBack={this.goBackToFormPage}
        responseId={this.state.responseId}
      />);
    }
  }
}

export default FormPage;