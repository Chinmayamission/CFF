import {get, set} from "lodash";
export default function createSchemas(data, specifiedShowFields={}, responseId=null, responseData=null) {
    for (let i in specifiedShowFields) {
        set(data["schema"], i, specifiedShowFields[i]);
    }
    return {
        schemaMetadata: get(data, "formOptions", {}),
        uiSchema: data["uiSchema"],
        schema: data["schema"],
        defaultFormData: get(data, "formOptions.defaultFormData", {}),
        paymentCalcInfo: get(data, "formOptions.paymentInfo", {}),
        dataOptions: get(data, "formOptions.dataOptions", {}),
        formOptions: get(data, "formOptions", {}),
        cff_permissions: get(data, "cff_permissions", {}),
        responseId,
        responseData,
        name: data["name"],
        _id: data["_id"]
    };
}