import React from "react";
import DOMPurify from 'dompurify';
import Form from "react-jsonschema-form";

import ArrayFieldTemplate from "./form_templates/ArrayFieldTemplate";
import ObjectFieldTemplate from "./form_templates/ObjectFieldTemplate";
import CustomFieldTemplate from "./form_templates/CustomFieldTemplate";
import CheckboxWidget from "./form_widgets/CheckboxWidget";
import SmallTextboxWidget from "./form_widgets/SmallTextboxWidget";
import PhoneWidget from "./form_widgets/PhoneWidget";
import RoundOffWidget from "./form_widgets/RoundOffWidget";
import MoneyWidget from "./form_widgets/MoneyWidget"
import CouponCodeWidget from "./form_widgets/CouponCodeWidget"
import PaymentCalcTable from "src/form/payment/PaymentCalcTable";
import {get} from "lodash-es";


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
  "cff:roundOff": RoundOffWidget,
  "cff:money": MoneyWidget,
  "cff:couponCode": CouponCodeWidget
};

const fields = {
  DescriptionField: FormattedDescriptionField,
  TitleField: CustomTitleField
};

function validate(formData, errors) {
  console.log("running validate");
  return errors;
}

interface ICustomFormProps {
  schema: any,
  uiSchema: any,
  formData?: any,
  onChange?: (e) => void,
  onSubmit?: (e) => void,
  showPaymentTable?: boolean,
  paymentCalcInfo?: IPaymentCalcInfo
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
      return error;
    });
  }
  return (
    <div className="ccmt-cff-Page-FormPage">
      <Form
        schema={props.schema}
        uiSchema={props.uiSchema}
        formData={props.formData}
        widgets={widgets}
        fields={fields}
        noHtml5Validate={true}
        // FieldTemplate={CustomFieldTemplate}
        ArrayFieldTemplate={ArrayFieldTemplate}
        ObjectFieldTemplate={ObjectFieldTemplate}
        transformErrors={transformErrors}
        onChange={(e) => { props.onChange(e) }}
        onSubmit={(e) => props.onSubmit(e)}
        validate={validate}
        onError={(e) => { console.error(e); window.scrollTo(0, 0); }}
        showErrorList={true}
        ErrorList={ErrorListTemplate}
      >
        {props.showPaymentTable &&
          <div>
            {props.paymentCalcInfo && props.paymentCalcInfo.items && props.paymentCalcInfo.items.length > 0 &&
              <PaymentCalcTable formData={props.formData} paymentCalcInfo={props.paymentCalcInfo} />
            }
            <button className="btn btn-primary btn-lg" type="submit">Submit</button>
          </div>
        }
      </Form>
    </div>);
}
export default CustomForm;