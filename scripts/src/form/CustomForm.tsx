import React, { Suspense, lazy, useState } from "react";
import sanitize from "../sanitize";
import Form from "@rjsf/core";
import "./form.scss";
import ArrayFieldTemplate from "./form_templates/ArrayFieldTemplate";
import ObjectFieldTemplate from "./form_templates/ObjectFieldTemplate";
import CustomFieldTemplate from "./form_templates/CustomFieldTemplate";
import CheckboxWidget from "./form_widgets/CheckboxWidget";
import SmallTextboxWidget from "./form_widgets/SmallTextboxWidget";
import PhoneWidget from "./form_widgets/PhoneWidget";
import MoneyWidget from "./form_widgets/MoneyWidget";
import SameAsField from "./form_widgets/SameAsField";
import AutoPopulateField from "./form_widgets/AutoPopulateField";
import CouponCodeWidget from "./form_widgets/CouponCodeWidget";
import PaymentCalcTable from "./payment/PaymentCalcTable";
import { get } from "lodash";
import { IPaymentCalcInfo } from "./payment/PaymentCalcTable.d";
import ExpressionParser from "../common/ExpressionParser";
import { ConfirmWidget } from "./form_widgets/ConfirmWidget";
import FileInputAndPreviewWidget from "./form_widgets/FileInputAndPreviewWidget";
// import JSONEditorWidget from "./form_widgets/JSONEditorWidget";
import ConditionalHiddenRadioWidget from "./form_widgets/ConditionalHiddenRadioWidget";
import InfoboxRadioWidget from "./form_widgets/InfoboxRadioWidget";
import InfoboxSelectWidget from "./form_widgets/InfoboxSelectWidget";
import RemovedWidget from "./form_widgets/RemovedWidget";
import SubmitInputGroupWidget from "./form_widgets/SubmitInputGroupWidget";
import DynamicEnumField from "./form_widgets/DynamicEnumField";
import AddressAutocompleteField from "./form_widgets/AddressAutocompleteField";
import { IResponseMetadata } from "./interfaces";

const JSONEditorWidget = lazy(() => import("./form_widgets/JSONEditorWidget"));

export const FormattedDescriptionField = ({ id, description }) => {
  if (!description) return null;
  return (
    <div id={id} className="ccmt-cff-form-description my-2">
      <div dangerouslySetInnerHTML={{ __html: sanitize(description) }} />
    </div>
  );
};

const CustomTitleField = props => {
  const { title, required } = props;
  if (!title || !title.trim()) {
    return <span />;
  }
  const legend = required ? title + "*" : title;
  return (
    <h2
      className="ccmt-cff-form-title"
      dangerouslySetInnerHTML={{ __html: sanitize(legend) }}
    />
  );
};

function ErrorListTemplate(props) {
  const { errors } = props;
  return (
    <div className="alert alert-danger my-4 ccmt-cff-errorList">
      <strong className="d-block mb-2">Errors:</strong>
      {errors.map((error, i) => {
        return <li key={i}>{error.stack}</li>;
      })}
    </div>
  );
}

const widgets = {
  phone: PhoneWidget,
  CheckboxWidget: CheckboxWidget,
  FileWidget: FileInputAndPreviewWidget,
  "cff:smallTextbox": SmallTextboxWidget,
  "cff:money": MoneyWidget,
  "cff:couponCode": CouponCodeWidget,
  "cff:confirm": ConfirmWidget,
  "cff:jsonEditor": JSONEditorWidget,
  "cff:conditionalHiddenRadio": ConditionalHiddenRadioWidget,
  "cff:infoboxRadio": InfoboxRadioWidget,
  "cff:infoboxSelect": InfoboxSelectWidget,
  "cff:removed": RemovedWidget,
  "cff:submitInputGroup": SubmitInputGroupWidget
};

const fields = {
  DescriptionField: FormattedDescriptionField,
  TitleField: CustomTitleField,
  "cff:sameAs": SameAsField,
  "cff:autoPopulate": AutoPopulateField,
  "cff:dynamicEnum": DynamicEnumField,
  "cff:addressAutocomplete": AddressAutocompleteField,
  "cff:removed": RemovedWidget
};

function validate(formData, errors, validationSchema, responseMetadata) {
  for (let item of validationSchema) {
    if (
      ExpressionParser.calculate_price(
        item["if"],
        formData,
        true,
        responseMetadata
      )
    ) {
      errors.addError(item["then"]);
    }
  }
  // if (errors && errors.length) {
  //   alert("Errors: \n" + errors.map(e => e.stack).join("\n"));
  // }
  return errors;
}

const submitOptionsSchema = {
  type: "object",
  title: "",
  description: "",
  properties: {
    sendEmail: {
      title: "Send confirmation email",
      description: "Send a confirmation email on submit.",
      type: "boolean",
      default: true
    }
  }
};

const submitOptionsUiSchema = {
  sendEmail: {
    "ui:widget": "select"
  }
};

interface ICustomFormProps {
  schema: any;
  uiSchema: any;
  formData?: any;
  onChange?: (e) => void;
  onSubmit?: (e, f?) => void;
  showPaymentTable?: boolean;
  paymentCalcInfo?: IPaymentCalcInfo;
  className?: string;
  children?: any;
  omitExtraData?: boolean;
  tagName?: keyof JSX.IntrinsicElements;
  responseMetadata?: IResponseMetadata;
  showSubmitOptions?: boolean;
}

function CustomForm(props: ICustomFormProps) {
  const [submitOptions, setSubmitOptions] = useState({});
  /* Adds a custom error message for regex validation (especially for phone numbers).
   */
  function transformErrors(errors) {
    console.warn("transform", errors);
    return errors.map(error => {
      if (error.name === "pattern") {
        error.message = "Please enter a value in the correct format.";
      }
      if (error.message && error.message.match(/is a required property/)) {
        error.message = error.message.replace(
          /is a required property/,
          "is a required field"
        );
      }
      return error;
    });
  }

  return (
    <div
      className={`ccmt-cff-Page-FormPage${
        props.className ? " " + props.className : ""
      }`}
    >
      <Form
        tagName={props.tagName}
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
        onChange={e => {
          props.onChange && props.onChange(e);
        }}
        onSubmit={e => props.onSubmit && props.onSubmit(e, submitOptions)}
        validate={(d, e) =>
          validate(
            d,
            e,
            get(props.uiSchema, "ui:cff:validate", []),
            props.responseMetadata
          )
        }
        onError={e => {
          console.error(e);
          window.scrollTo(0, 0);
        }}
        showErrorList={true}
        ErrorList={ErrorListTemplate}
        formContext={{ formData: props.formData }}
        omitExtraData={props.omitExtraData}
        liveOmit={props.omitExtraData}
      >
        {props.children}
        {!props.children && props.showPaymentTable && (
          <div>
            {props.paymentCalcInfo &&
              props.paymentCalcInfo.items &&
              props.paymentCalcInfo.items.length > 0 && (
                <PaymentCalcTable
                  formData={props.formData}
                  responseMetadata={props.responseMetadata}
                  paymentCalcInfo={props.paymentCalcInfo}
                />
              )}
          </div>
        )}
        {!props.children && (
          <div>
            <button className="btn btn-info" type="submit">
              {props.uiSchema["ui:cff:submitButtonText"] || "Submit"}
            </button>
          </div>
        )}
        {!props.children && props.showSubmitOptions && (
          <div className="mt-4 card">
            <div className="card-header">
              <strong>Submit options (for admins only)</strong>
            </div>
            <div className="card-body">
              <CustomForm
                schema={submitOptionsSchema}
                uiSchema={submitOptionsUiSchema}
                formData={submitOptions}
                onChange={e => setSubmitOptions(e.formData)}
              >
                &nbsp;
              </CustomForm>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}
export default CustomForm;
