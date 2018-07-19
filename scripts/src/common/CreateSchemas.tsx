import {get, assign} from "lodash-es";
export default function createSchemas(data, specifiedShowFields={}) {
    return {
        schemaMetadata: get(data, "formOptions", {}),
        uiSchema: data["uiSchema"],
        schema: assign(data["schema"], specifiedShowFields),
        defaultFormData: get(data, "formOptions.defaultFormData", {}),
        paymentCalcInfo: get(data, "formOptions.paymentInfo", {}),
        dataOptions: get(data, "formOptions.dataOptions", {}),
        formOptions: get(data, "formOptions", {})
    };
}