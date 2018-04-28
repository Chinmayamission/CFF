/// <reference path="./FormStandalone.d.ts"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import "./FormStandalone.scss";
import FormPage from "src/form/FormPage";
import * as queryString from "query-string";
import {get, pick} from "lodash-es";

/* Standalone form page, displayed in /forms/{formId}
 * Yes.
*/
class FormStandalone extends React.Component<IFormStandaloneProps, IFormStandaloneState> {
  constructor(props: any) {
    super(props);
    this.state = {
      backgroundColor: null
    };

  }
  onFormLoad(schema, uiSchema) {
    let opts: any = {};
    get(uiSchema, "ui:cff:backgroundColor") && (opts.backgroundColor = get(uiSchema, "ui:cff:backgroundColor"));
    this.setState(opts);
  }
  render() {
    let qs = queryString.parse(this.props.location.search);
    return (<div className="App ccmt-cff-page-form" style={this.state.backgroundColor && { backgroundColor: this.state.backgroundColor }}>
      <div className="container ccmt-cff-paper-outline">
        <FormPage formId={this.props.formId}
          onFormLoad={(a, b) => this.onFormLoad(a, b)}
          authKey={null}
          specifiedShowFields={JSON.parse((qs && qs["specifiedShowFields"]) || "{}")}
          apiEndpoint={this.props.ENDPOINT_URL} />
      </div>
    </div>);
  }
}

export default FormStandalone;