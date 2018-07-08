import {get} from "lodash-es";
export default function createSchemas(data) {
    return {
        schemaMetadata: get(data, "formOptions", {}),
        uiSchema: data["uiSchema"],
        schema: data["schema"],
        defaultFormData: get(data, "formOptions.defaultFormData", {}),
        paymentCalcInfo: get(data, "formOptions.paymentInfo", {}),
        dataOptions: get(data, "formOptions.dataOptions", {})
    };
}