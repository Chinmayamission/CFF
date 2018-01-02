/// <reference path="./interfaces.d.ts"/>
import * as React from 'react';

import Form from 'react-jsonschema-form';

import SchemaField from "react-jsonschema-form";
import TitleField from "react-jsonschema-form";
import DescriptionField from "react-jsonschema-form";
import * as deref from "json-schema-deref-sync";
import * as Promise from 'bluebird';
import axios from 'axios';
import FormConfirmationPage from "./FormConfirmationPage";

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
      <div>{description}</div>
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

const BaseInputWidget:any = (props: any) => {
  const {options} = props;
  const {visible, required} = options;
  if (false && !visible) {
    // return (null);
  }
  else {
    return (
      <input type="text"
        className="custom"
        value={props.value}
        required={required}
        onChange={(event) => props.onChange(event.target.value)} />
    );
  }
};

BaseInputWidget.defaultProps = {
  options: {
    visible: false,
    required: false
  }
};


const widgets = {
  phoneWidget: PhoneWidget,
  // BaseInput: BaseInputWidget
};

const fields = {
  // TitleField: CustomTitleField,
  //DescriptionField: CustomDescriptionField
  // SchemaField: CustomSchemaField
};

const schema = {};


const uiSchema = {};

var This;
//const log = (type: {}) => console.log.bind(console, type);
const log = console.log;

class FormPage extends React.Component<IFormPageProps, IFormPageState> {

  constructor(props:any) {
    super(props);
    This = this;
    this.state ={
      status: STATUS_FORM_LOADING,
      schema: {"title": "ABC", "type": "object"},
      uiSchema: {"title": "status"},
      step: 0,
      data: {}
    };
  }
  unescapeJSON(json:{}) {
    /* Un-escapes dollar signs in the json.
     */
    return JSON.parse(JSON.stringify(json).replace(/\\\\u0024/g,"$"));
  }
  /* Modifies the master schema based on the options specific to this form.
   */
  populateSchemaWithOptions(schema, options) {
    for (let key in schema) {
      let schemaItem = schema[key];
      // Delete fields & sub-fields of the schema that aren't included in schemaModifiers.
      if (!options.hasOwnProperty(key)) {
        if (!~["type", "properties"].indexOf(key)) {
          //console.log("Deleting key " + key);
          delete schema[key];
        }
        continue;
      }
      // Recursively call this function on objects (with properties).
      if (this.isObject(schemaItem)) {
        if (options[key] === Object(options[key])) {
          if (schemaItem["properties"])
            this.populateSchemaWithOptions(schemaItem["properties"], options[key]);
          else // for an object without properties, such as {type: "string", title: "Last Name"}, or {enum: [1,2,3]}
            this.overwriteFlatJSON(schemaItem, options[key])
        }
      }
      // For everything else (strings, something with an "enum" property)
      else {
        schema[key] = options[key];
        //console.log("Replacing for key " + key + ", value " + schemaItem + " => " + options[key]);
      }
    }
    
  }

  /* Takes old json and replaces its properties with new's properties whenever possible.
   */
  overwriteFlatJSON(oldObj, newObj) {
    for (let i in newObj) {
      oldObj[i] = newObj[i];
    }
  }
  
  isObject(obj) {
    return Object(obj) === obj && !Array.isArray(obj)
  }

  /* Removes keys based on a test function.
   */
  removeKeysBasedOnTest(obj, testFn) {
    for (let i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (testFn(i)) {
        //console.log("Not deleting " + i);
        continue;
      }
      else if (this.isObject(obj[i])) {
        //console.log("checking to filter for object: ", obj, i, obj[i]);
          this.removeKeysBasedOnTest(obj[i], testFn);
      }
      else {
        delete obj[i];
        //console.log("Deleting " + i);
      }
    }
    return obj;
  }

  /* Starting with a schemaModifier,
   * removes all non-"ui:..." keys (and className) from a given uiSchema.
   */
  filterUiSchema(obj) {
    return this.removeKeysBasedOnTest(obj, (attr) => {
      let searchString = "ui:";
      return attr && (attr.substr(0, searchString.length) === searchString || attr == "classNames");
    });
  }

  componentDidMount() {    
    let formId = this.props.formId['$oid'];
    //let schemaModifiersUrl = "http://registration.chinmayamission.com/forms/" + formId + "/data/schemaWithModifiers";
    //schemaModifiersUrl = "http://www.chinmayamissionalpharetta.org/wp-json/";
    //axios.get(schemaModifiersUrl, {"responseType": "json"})
    //.then((response) => {
    //  return {
    //    "schema": {
    //      "title": "My form!",
    //      type: "object",
    //      properties: {
    //        bar: {type: "string"},
    //        name: {
    //          "type": "object",
    //          "properties": {
    //            "first": {"type": "string"},
    //            "last": {"type": "string"}
    //          }
    //        }
    //      }
    //    },
    //    "schemaModifiers": {
    //      "name": {
    //        "first": {
    //          "ui:widget": "textarea"
    //        }
    //      },
    //      "title": "Form 2"
    //    }
    //  }
    //  // return response.data
    //})
    //.then(this.unescapeJSON)
    //.then((data) => {
    //  var options = data["schemaModifiers"];
    //  var uiSchema = options;
    //  var schema = data["schema"];
    //  console.log(schema);
    //  schema = deref(schema);
    //  console.log(schema);
    //  this.populateSchemaWithOptions(schema["properties"], options);
    //  this.filterUiSchema(uiSchema);
    //  console.log(options, uiSchema, schema);
    //    
    //  This.setState({ uiSchema: uiSchema, schema: schema, status: STATUS_FORM_RENDERED });
    //  
    //});
    let endpoint = 'https://ajd5vh06d8.execute-api.us-east-2.amazonaws.com/prod/gcmw-cff-render-form';
    let apiKey = 'test';
    let formListUrl = endpoint + "?action=formRender" + "&id=" + formId;
    axios.get(formListUrl, {"responseType": "json"})
        .then(response => response.data.res[0])
        .then(this.unescapeJSON)
        .then((data) => {
          console.log("DATA:\n", data);
          var options = data["schemaModifier"].value;
          var uiSchema = options;
          var schema = data["schema"].value;
          console.log(schema);
          schema = deref(schema);
          console.log(schema);
          this.populateSchemaWithOptions(schema["properties"], options);
          this.filterUiSchema(uiSchema);
          console.log(options, uiSchema, schema);
            
          This.setState({ uiSchema: uiSchema, schema: schema, status: STATUS_FORM_RENDERED });
          
        });

    
  }
  goBackToFormPage() {
    This.setState({status: STATUS_FORM_RENDERED});
  }
  onSubmit(data: {formData: {}}) {
    var formData = data.formData;
    // (document.getElementById("inputData") as HTMLInputElement).value = JSON.stringify(formData);
    // (document.getElementById("mainForm") as HTMLFormElement).submit();
    var token = (document.getElementsByName("csrfmiddlewaretoken")[0] as HTMLInputElement).value;
    var instance = axios.create({
      headers: {
        "X-CSRFToken": (document.getElementsByName("csrfmiddlewaretoken")[0] as HTMLInputElement).value,
        "Content-Type": "application/json"
      }
    });
    instance.post("", formData).then((response) => {
      console.log("success!", response);
      This.setState({status: STATUS_FORM_SUBMITTED, data: formData});
    }).catch((err) => {
      alert("Error. " + err);
    });
  }
  render() {
    if (this.state.status == STATUS_FORM_LOADING) {
      return ( 
        <div className='my-nice-tab-container'>
          <div className='loading-state'>Loading...</div>
        </div>)
    } else if (this.state.status == STATUS_FORM_RENDERED) {
      //if (!this.state.step) 
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
            onSubmit={this.onSubmit}
            onError={() => log('errors')}
            />
        </div>
      );
    }
    else if (this.state.status == STATUS_FORM_SUBMITTED) {
      return (<FormConfirmationPage
              schema={this.state.schema}
              uiSchema={this.state.uiSchema}
              data={this.state.data}
              goBack={this.goBackToFormPage}
              />);
    }
  }
}

export default FormPage;