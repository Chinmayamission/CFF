import React from "react";
import { arrayAccessor } from "../../admin/util/SchemaUtil";
import CustomForm from "../CustomForm";

/* DynamicEnumField generates a dynamic set of enum options based on
 * form data.
 */
export default ({ schema, uiSchema, formContext, formData, onChange }) => {
  let accessor = uiSchema["ui:options"]["cff:dynamicEnumDataAccessor"];
  let options = arrayAccessor(formContext.formData, accessor) || [];
  let newSchema = {
    ...schema,
    enum: options
  };
  let { "ui:field": field, ...newUiSchema } = uiSchema;
  return (
    <CustomForm
      schema={newSchema}
      tagName={"div"}
      uiSchema={newUiSchema}
      formData={formData}
      className={"ccmt-cff-Page-SubFormPage-DynamicEnum"}
      onChange={e => onChange(e.formData)}
    >
      &nbsp;
    </CustomForm>
  );
};
