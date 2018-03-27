/// <reference path="./interfaces.d.ts"/>
import axios from 'axios';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Form from 'react-jsonschema-form';

import ArrayFieldTemplate from "./form_templates/ArrayFieldTemplate.tsx";
import ObjectFieldTemplate from "./form_templates/ObjectFieldTemplate.tsx";
import CustomFieldTemplate from "./form_templates/CustomFieldTemplate.tsx";
import CheckboxWidget from "./form_widgets/CheckboxWidget.tsx";
import PhoneWidget from "./form_widgets/PhoneWidget";
import RoundOffWidget from "./form_widgets/RoundOffWidget";
import MoneyWidget from "./form_widgets/MoneyWidget"
import CouponCodeWidget from "./form_widgets/CouponCodeWidget"
import ExpressionParser from "src/common/util/ExpressionParser";

import * as DOMPurify from 'dompurify';
import * as queryString from "query-string";
import { get, pick, set } from "lodash-es";
import "./form.scss";
import FormConfirmationPage from "./FormConfirmationPage";
import PaymentCalcTable from "src/form/payment/PaymentCalcTable";
import Loading from "src/common/Loading/Loading";
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";
import SchemaUtil from "src/common/util/SchemaUtil";

const STATUS_FORM_LOADING = 0;
const STATUS_FORM_RENDERED = 2;
const STATUS_FORM_CONFIRMATION = 4;
const STATUS_FORM_PAYMENT_SUCCESS = 6;


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


const FormattedDescriptionField = ({ id, description }) => {
  return <div id={id} className="my-2">
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
  return null;
  /*return (
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
  );*/
};



const widgets = {
  phone: PhoneWidget,
  CheckboxWidget: CheckboxWidget,
  "cff:roundOff": RoundOffWidget,
  "cff:money": MoneyWidget,
  "cff:couponCode": CouponCodeWidget
};

const fields = {
  DescriptionField: FormattedDescriptionField,
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
      paymentCalcInfo: null,
      data: null,
      responseId: null,
      responseLoaded: null,
      ajaxLoading: false,
      validationInfo: null,
      focusUpdateInfo: null
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
    //ReactDOM.findDOMNode(this).scrollIntoView();
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps, prevState) {
    let stateKeysToEncode = ["status", "responseId"];
    if (pick(this.state, stateKeysToEncode) != pick(prevState, stateKeysToEncode)) {
      let encodedState = pick(this.state, stateKeysToEncode);
      let newQS = queryString.stringify(encodedState);
      window.location.hash = newQS;//queryString.stringify(encodedState);  
      if (this.state.status != prevState.status) {
        this.scrollToTop();
      }
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
      FormLoader.loadResponseAndCreateSchemas(this.props.apiEndpoint, this.props.formId, this.props.authKey, this.props.specifiedShowFields, queryObjFlat["responseId"], (e) => this.handleError(e))
      .then(({ schemaMetadata, uiSchema, schema, responseLoaded, paymentCalcInfo, validationInfo, focusUpdateInfo }) => {
        this.setState({ schemaMetadata, uiSchema, schema, validationInfo,
          responseId: responseLoaded["responseId"],
          responseLoaded: responseLoaded,
          data: responseLoaded ? responseLoaded.value : null,
          status: STATUS_FORM_RENDERED,
          paymentCalcInfo,
          focusUpdateInfo
        });
      });
    }
    else {
      if ((window as any).CCMT_CFF_DEVMODE_AUTOFILL == true) {
        this.setState({data: MockData.sampleData});
      }
      FormLoader.getFormAndCreateSchemas(this.props.apiEndpoint, this.props.formId, this.props.authKey, this.props.specifiedShowFields, (e) => this.handleError(e))
      .then(({ schemaMetadata, uiSchema, schema, defaultFormData, paymentCalcInfo, validationInfo, focusUpdateInfo }) => {
        this.setState({ schemaMetadata, uiSchema, schema, validationInfo,
          status: STATUS_FORM_RENDERED,
          data: defaultFormData,
          paymentCalcInfo,
          focusUpdateInfo
        });
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

    this.setState({ajaxLoading: true});
    instance.post(this.getFormSubmitUrl(), formData).catch(e => {
      if ((window as any).CCMT_CFF_DEVMODE === true) {
        return MockData.newResponse();
      }
      this.setState({ajaxLoading: false});
      alert("Error submitting the form. " + e);
    }).then((response) => {
      let res = response.data.res;
      if (!(res.success == true && res.id)) {
        this.setState({ajaxLoading: false});
        if (res.success == false && res.message) {
          if (res.fields_to_clear && res.fields_to_clear.length) {
            let formDataNew = formData;
            for (let field of res.fields_to_clear) {
              set(formDataNew, field, "");
            }
            this.setState({data: formDataNew})
          }
          throw "Error submitting the form: " + res.message;
        }
        else {
          throw "Response not formatted correctly: " + JSON.stringify(res);
        }
      }
      let newResponse = res.action == "insert";
      this.setState({
        ajaxLoading: false,
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
  onChange(e) {
    this.setState({"data": e.formData});
  }
  onFocus(rootPath, value) {
    //let toPath = "email";
    let toPath = SchemaUtil.rootPathToSchemaModifierPath(rootPath);
    let formData = this.state.data;
    /*if (true) {
      for (let focusUpdateInfoItem of this.state.focusUpdateInfo) {
        if (focusUpdateInfoItem.type == "copy") { // && get(this.state.data, focusUpdateInfoItem.to) == get(this.state.data, toPath)) {
          let fromValue = get(this.state.data, focusUpdateInfoItem.from);
          //console.log(focusUpdateInfoItem, fromValue);
          if (fromValue) {
            set(formData, focusUpdateInfoItem.to, fromValue);
            console.log(JSON.stringify(formData));
            this.setState({"data": formData});
            //this.forceUpdate();
          }
        }
      }
    }*/
  }
  /*invalidItem(item, ) {

  }*/
  validate(formData, errors) {
    console.log("errs are", errors);
    if (this.state.validationInfo) {
      for (let info of this.state.validationInfo) {
        let path = info["fieldPath"];
        path = path.replace(/\.items/g, "");
        let value = get(formData, path);
        if (value && value.length) {
          // array validation.
          for (let item of value) {
            try {
              let result = ExpressionParser.calculate_price(info.ifExpr, item);
              if (result) {
                get(errors, path).addError(info.message);
                break;
              }
            }
            catch (e) {
              get(errors, path).addError(e);
              break;
            }
          }
        }
      }
    }
    return errors;
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
          FieldTemplate={CustomFieldTemplate}
          ArrayFieldTemplate={ArrayFieldTemplate}
          ObjectFieldTemplate={ObjectFieldTemplate}
          transformErrors={transformErrors}
          onChange={(e) => {this.onChange(e)}}
          onFocus={(e, v) => {this.onFocus(e, v)}}
          onSubmit={(e) => this.onSubmit(e)}
          onError={(e) => this.scrollToTop()}
          showErrorList={true}
          ErrorList={ErrorListTemplate}
          validate={(a, b) => this.validate(a, b)}
        >
          {this.state.status == STATUS_FORM_RENDERED &&
            <div>
              <PaymentCalcTable formData={this.state.data} paymentCalcInfo={this.state.paymentCalcInfo} />
              <button className="btn btn-primary btn-lg" type="submit">Submit</button>
            </div>
          }
        </Form>
        {this.state.ajaxLoading && <Loading hasError={this.state.hasError} />}
      </div>
    );
    if (this.state.status == STATUS_FORM_CONFIRMATION) {
      return (<div>
          <h1>Confirmation Page</h1>
          <button className="btn btn-default"
            onClick={this.goBackToFormPage}
          >Go back and edit form response</button>
          {formToReturn}
          <button className="btn btn-default"
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