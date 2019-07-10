import { get, set } from "lodash";
export default function createSchemas(
  data,
  specifiedShowFields = {},
  responseId = null,
  responseData = null
) {
  for (let i in specifiedShowFields) {
    set(data["schema"], i, specifiedShowFields[i]);
  }
  let defaultFormData = get(data, "formOptions.defaultFormData", {});
  let formOptions = get(data, "formOptions", {});
  let schema = data["schema"];
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
