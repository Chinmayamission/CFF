/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';
import Form from 'react-jsonschema-form';
import SchemaField from "react-jsonschema-form";
import TitleField from "react-jsonschema-form";
import DescriptionField from "react-jsonschema-form";
import * as DOMPurify from 'dompurify';
import axios from 'axios';
import "./form.scss";
import FormConfirmationPage from "./FormConfirmationPage";
import Loading from "src/common/loading";
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";

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
          let customClasses = {
            "half": "col-12 col-sm-6",
            "flex": "col",
            "full": "col-12"
          };
          if (!prop.content.props.uiSchema.classNames) {
            prop.content.props.uiSchema.classNames = "col-12";
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
  const legend = required ? title + '*' : title;
  return <h2 className="ccmt-cff-form-title">
    {legend}
  </h2>;
};

function ErrorListTemplate(props) {
  const {errors} = props;
  return (
    <div>
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
      schemaMetadata: {},
      schema: { "title": "None", "type": "object" },
      uiSchema: { "title": "status" },
      step: 0,
      data: {
        "email": "aramaswamis@gmail.com",
        "participants": [
          {
            "name": {
              "first": "Kalyani",
              "last": "Sank"
            },
            "age": 5,
            "race": "10K"
          },
          {
            "name": {
              "first": "Arvind",
              "last": "Ramaswami"
            },
            "age": 40,
            "race": "10K"
          }
        ],
        "acceptTerms": {
          "accept": true
        },
        "address": { "line1": "123 ABC Lane", "city": "Johns Creek", "state": "GA", "zipcode": "30022" },
      },
      responseId: null
    };
  }

  getFormUrl(action) {
    let formId = this.props.formId['$oid'];
    return this.props.apiEndpoint + "?action=" + action + "&id=" + formId;
  }
  scrollToTop() {
    // todo: scroll to top.
  }

  componentDidMount() {
    FormLoader.getFormAndCreateSchemas(this.props.apiEndpoint, this.props.formId['$oid']).then(({ schemaMetadata, uiSchema, schema }) => {
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
    instance.post(this.getFormUrl("formSubmit"), formData).catch(e => {
      if ((window as any).CCMT_CFF_DEVMODE===true) {
          return MockData.newResponse();
      }
      alert("Error loading the form list. " + e);
  }).then((response) => {
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
        <div className="ccmt-cff-Page-FormPage">
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
            onError={(e) => this.scrollToTop()}
            showErrorList={true}
            ErrorList={ErrorListTemplate}
          />
        </div>
      );
    }
    else if (this.state.status == STATUS_FORM_SUBMITTED) {
      return (<FormConfirmationPage
        apiEndpoint={this.props.apiEndpoint}
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