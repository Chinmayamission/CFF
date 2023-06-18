import { get, set } from "lodash";
export default function createSchemas(
  data,
  specifiedShowFields = {},
  initialFormData = {},
  responseId = null,
  responseData = null
) {
  for (let i in specifiedShowFields) {
    if (i.startsWith("CFF_uiSchema.")) {
      let fieldName = i.split("CFF_uiSchema.")[1];
      set(data["uiSchema"], fieldName, specifiedShowFields[i]);
    } else {
      set(data["schema"], i, specifiedShowFields[i]);
    }
  }
  let defaultFormData = get(data, "formOptions.defaultFormData", {});
  let formOptions = get(data, "formOptions", {});
  let schema = data["schema"];
  for (let i in initialFormData) {
    set(defaultFormData, i, initialFormData[i]);
  }
  return {
    schemaMetadata: formOptions,
    uiSchema: data["uiSchema"],
    schema,
    defaultFormData,
    paymentCalcInfo: get(data, "formOptions.paymentInfo", {}),
    dataOptions: get(data, "formOptions.dataOptions", {}),
    formOptions,
    cff_permissions: get(data, "cff_permissions", {}),
    responseId,
    responseData,
    name: data["name"],
    _id: data["_id"]
  };
}
