import React from "react";
import DOMPurify from 'dompurify';
import Form from "react-jsonschema-form";
import "./form.scss";
import ArrayFieldTemplate from "./form_templates/ArrayFieldTemplate";
import ObjectFieldTemplate from "./form_templates/ObjectFieldTemplate";
import CustomFieldTemplate from "./form_templates/CustomFieldTemplate";
import CheckboxWidget from "./form_widgets/CheckboxWidget";
import SmallTextboxWidget from "./form_widgets/SmallTextboxWidget";
import PhoneWidget from "./form_widgets/PhoneWidget";
import MoneyWidget from "./form_widgets/MoneyWidget"
import SameAsField from "./form_widgets/SameAsField"
import CouponCodeWidget from "./form_widgets/CouponCodeWidget"
import PaymentCalcTable from "./payment/PaymentCalcTable";
import { get } from "lodash";
import { IPaymentCalcInfo } from "./payment/PaymentCalcTable.d";
import ExpressionParser from "../common/ExpressionParser";


const FormattedDescriptionField = ({ id, description }) => {
  if (!description) return null;
  return <div id={id} className="my-2">
    <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(description) }} />
  </div>;
};

const CustomTitleField = ({ title, required }) => {
  if (!title || !title.trim()) {
    return <span />;
  }
  const legend = required ? title + '*' : title;
  return <h2 className="ccmt-cff-form-title" dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(legend) }} />;
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
  "cff:smallTextbox": SmallTextboxWidget,
  "cff:money": MoneyWidget,
  "cff:couponCode": CouponCodeWidget
};

const fields = {
  DescriptionField: FormattedDescriptionField,
  TitleField: CustomTitleField,
  "cff:sameAs": SameAsField
};

function validate(formData, errors, validationSchema) {
  for (let item of validationSchema) {
    if (ExpressionParser.calculate_price(item["if"], formData)) {
      errors.addError(item["then"]);
    }
  }
  // if (errors && errors.length) {
  //   alert("Errors: \n" + errors.map(e => e.stack).join("\n"));
  // }
  return errors;
}

interface ICustomFormProps {
  schema: any,
  uiSchema: any,
  formData?: any,
  onChange?: (e) => void,
  onSubmit?: (e) => void,
  showPaymentTable?: boolean,
  paymentCalcInfo?: IPaymentCalcInfo,
  className?: string
}

function CustomForm(props: ICustomFormProps) {
  /* Adds a custom error message for regex validation (especially for phone numbers).
 */
  function transformErrors(errors) {
    console.warn("transform", errors);
    return errors.map(error => {
      if (error.name === "pattern") {
        error.message = "Please enter a value in the correct format."
      }
      if (error.message.match(/is a required property/)) {
        error.message = error.message.replace(/is a required property/, "is a required field");
      }
      return error;
    });
  }
  return (
    <div className={`ccmt-cff-Page-FormPage${props.className ? " " + props.className : ""}`}>
      <Form
        schema={props.schema}
        uiSchema={props.uiSchema}
        formData={props.formData}
        widgets={widgets}
        fields={fields}
        autocomplete={props.uiSchema["ui:cff:autocomplete"] ? "true" : "false"}
        noHtml5Validate={false}
        // FieldTemplate={CustomFieldTemplate}
        ArrayFieldTemplate={ArrayFieldTemplate}
        ObjectFieldTemplate={ObjectFieldTemplate}
        transformErrors={transformErrors}
        onChange={(e) => { props.onChange && props.onChange(e) }}
        onSubmit={(e) => props.onSubmit && props.onSubmit(e)}
        validate={(d, e) => validate(d, e, get(props.uiSchema, "ui:cff:validate", []))}
        onError={(e) => { console.error(e); window.scrollTo(0, 0); }}
        showErrorList={true}
        ErrorList={ErrorListTemplate}
        formContext={{formData: props.formData}}
      >
        {props.showPaymentTable &&
          <div>
            {props.paymentCalcInfo && props.paymentCalcInfo.items && props.paymentCalcInfo.items.length > 0 &&
              <PaymentCalcTable formData={props.formData} paymentCalcInfo={props.paymentCalcInfo} />
            }
          </div>
        }
        <p>
          <button className="btn btn-info" type="submit">{props.uiSchema["ui:cff:submitButtonText"] || "Submit"}</button>
        </p>
      </Form>
    </div>);
}
export default CustomForm;