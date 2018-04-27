import { set, unset, get, isArray } from 'lodash-es';
import SchemaUtil from "./SchemaUtil";
import * as deref from "json-schema-deref-sync/dist";
import { flatten } from 'flat';

interface IResult {
    schemaMetadata: any,
    uiSchema: any,
    schema: any,
    defaultFormData?: any,
    paymentCalcInfo: any,
    validationInfo: any,
    focusUpdateInfo: any,
    dataOptions: any,
    responseLoaded?: any
}
function removeUiOrder(schemaModifierFieldPath, uiSchema, propertyName) {
    let paths = schemaModifierFieldPath.split(".");
    paths.pop();
    paths.push("ui:order");
    let uiOrder = get(uiSchema, paths.join("."));
    // console.log("uiorder", uiOrder, propertyName, paths.join("."));
    if (uiOrder && uiOrder.length) {
        let index = uiOrder.indexOf(propertyName);
        if (index > -1) {
            console.warn("Removing ui:order property for", propertyName);
            uiOrder.splice(index, 1);
        }
        //
    }
}

function unescapeJSON(json: {}) {
    /* Un-escapes dollar signs in the json.
     */
    let str = JSON.stringify(json);
    return JSON.parse(JSON.stringify(json).replace(/\\\\u0024/g, "$"));
}

let isUiSchemaKey = (attr) => {
    let searchString = "ui:";
    return attr && (attr.substr(0, searchString.length) === searchString || attr == "classNames");
};

let isUiSchemaPath = (path) => {
    return path && (~path.indexOf("ui:") || ~path.indexOf("classNames"));
}

export module CreateSchemas {
    export function createSchemas(data, specifiedShowFields) {
        let validationInfo: IValidationInfoItem[] = [];
        let focusUpdateInfo: IFocusUpdateInfoItem[] = [];
        let isEditingResponse = !!data["responseLoaded"];
        let paymentCalcInfo = data['schemaModifier'].paymentInfo; // Information about payment for purposes of calculation.
        var schemaModifier = data["schemaModifier"].value;
        let dataOptions = data['schemaModifier'].dataOptions || {};
        // var uiSchema = schemaModifier;
        let schema = data["schema"].value;
        schema = deref(schema);
        schemaModifier = deref(schemaModifier);

        // Config of payment schemaModifier in schemaMetadata:
        let schemaMetadata = {};
        let POSSIBLE_METADATA_FIELDS = ["confirmationEmailInfo", "paymentInfo", "paymentMethods", "dataOptions"];
        for (let key in data.schema) {
            if (~POSSIBLE_METADATA_FIELDS.indexOf(key))
                schemaMetadata[key] = data.schema[key];
        }
        for (let key in data.schemaModifier) {
            if (~POSSIBLE_METADATA_FIELDS.indexOf(key) && typeof data.schemaModifier[key] != "boolean")
                schemaMetadata[key] = data.schemaModifier[key];
        }

        // specified show fields -- lets you do a custom override of schemaModifiers.
        for (let key in specifiedShowFields) {
            let value = specifiedShowFields[key];
            set(schemaModifier, key, value);
        }

        console.log('orig schema', schema, 'orig schemamodifier', schemaModifier);
        let uiSchema = {};

        // Populate uiSchema with uiSchema options specified in the schema,
        // and remove uiSchema attributes in the schema.
        let flattenedSchema = flatten(schema, { safe: true }); // safe: true preserves arrays.
        let flattenedSchemaModifier = flatten(schemaModifier, { safe: true });
        for (let fieldPath in flattenedSchema) {
            let fieldValue = flattenedSchema[fieldPath];
            let schemaModifierFieldPath = SchemaUtil.objToSchemaModifierPath(fieldPath);
            if (isUiSchemaPath(fieldPath)) {
                // Set the appropriate ui schema paths specified in the original schema.
                unset(schema, fieldPath);
                set(uiSchema, schemaModifierFieldPath, fieldValue);
            }
        }
        // Don't include field in schema (and uiSchema) if it's not in the schemaModifier.
        for (let schemaFieldSubPath in flattenedSchema) {
            let paths = schemaFieldSubPath.split(".");
            let propertyName = paths.pop();
            if (propertyName != "type") continue;
            let fieldName = paths[paths.length - 1];
            let schemaFieldPath = paths.join(".");
            let schemaModifierFieldPath = SchemaUtil.objToSchemaModifierPath(schemaFieldPath);
            // Don't include field in schema (and uiSchema) if it's not in the schemaModifier.
            if (!get(schemaModifier, schemaModifierFieldPath)) {
                console.warn("Removing schema property for", schemaFieldPath, schemaModifierFieldPath);
                unset(schema, schemaFieldPath);
                unset(uiSchema, schemaModifierFieldPath);
                removeUiOrder(schemaModifierFieldPath, uiSchema, fieldName);
            }
            // Remove from ui-order if exists.

        }

        let defaultFormData = {};
        let toSetAtEnd = [];

        // Applies schema modifier attributes to uiSchema and schema.
        for (let fieldPath in flattenedSchemaModifier) {
            let fieldValue = flattenedSchemaModifier[fieldPath];
            // console.log("fp", fieldPath, fieldValue);
            let schemaFieldPath = SchemaUtil.objToSchemaPath(fieldPath);
            if (typeof fieldValue === 'string' && ~fieldValue.indexOf("ui:cff:updateFromField:")) {
                // Update from field.
                let fieldKeyName = fieldPath.substring(0, fieldPath.lastIndexOf("."));
                focusUpdateInfo.push({
                    type: "copy",
                    from: fieldValue.replace("ui:cff:updateFromField:", ""),
                    to: isUiSchemaKey(fieldKeyName) ? fieldPath : `properties.${schemaFieldPath}`,
                    which: isUiSchemaKey(fieldKeyName) ? "uiSchema" : "schema"
                });
                // replace replaces the last part after the last dot:
                fieldValue = get(flattenedSchemaModifier, fieldPath.replace(/\.[^.]*?$/, ".ui:cff:defaultValue") , 0); //todo: do a better more sensible default, based on schema type.
                flattenedSchemaModifier[fieldPath] = fieldValue;
            }

            if (~["title", "description"].indexOf(fieldPath) || fieldPath == "required") {
                // Top-level modifications.
                schema[fieldPath] = fieldValue;
            }
            else if (isUiSchemaPath(fieldPath)) {
                //console.log(fieldPath);
                if (isEditingResponse && ~fieldPath.indexOf(".ui:cff:nonModifiable")) {
                    // todo - not working? test. - Set nonModifiable fields to readonly when editing an existing response.
                    // console.log("Yes");
                    set(uiSchema, fieldPath.replace(".ui:cff:nonModifiable", ".ui:cff:readonly"), fieldValue);
                }
                else if (~fieldPath.indexOf(".ui:cff:defaultValue")) {
                    // lets defaultFormData be filled out by the "ui:defaultValue" attribute
                    set(defaultFormData, fieldPath.substring(0, fieldPath.indexOf(".ui:cff:defaultValue")), fieldValue);
                }
                else if (~fieldPath.indexOf(".ui:cff:validate:if")) {
                    let ifExpr = fieldValue;
                    let message = get(schemaModifier, fieldPath.replace(".ui:cff:validate:if", ".ui:cff:validate:message"));
                    ifExpr = ifExpr && isArray(ifExpr) ? ifExpr : [ifExpr];
                    message = message && isArray(message) ? message : [message || "Error"];
                    for (let i = 0; i < ifExpr.length; i++) {
                        let index = i;
                        if (i >= message.length)
                            index = message.length - 1;
                        validationInfo.push({
                            fieldPath: fieldPath.replace(".ui:cff:validate:if", ""),
                            ifExpr: ifExpr[i],
                            message: message[index]
                        });
                    }
                }
                else if (~fieldPath.indexOf(".ui:cff:copyValueTo")) {
                    // focusUpdateInfo.push({
                    //     type: "copy",
                    //     from: fieldPath.replace(".ui:cff:copyValueTo", ""),
                    //     to: fieldValue
                    // })
                }
                else if (~fieldPath.indexOf(".ui:cff:display:if:specified")) {
                    // Show field only if it's in the specified show fields attribute.
                    // todo: fix this -- should be fieldValue, not fieldPath.replace(....).
                    if (isArray(specifiedShowFields) && ~specifiedShowFields.indexOf(fieldPath.replace(".ui:cff:display:if:specified", ""))) {
                        set(uiSchema, fieldPath, fieldValue);
                    }
                    else {
                        toSetAtEnd.push(() => set(uiSchema, fieldPath.replace("ui:cff:display:if:specified", "ui:widget"), "hidden"));
                    }
                }
                else {
                    if (~fieldPath.indexOf(".ui:cff")) {
                        console.error("Adding a CFF UI attribute into schema which hasn't been handled: ", fieldPath);
                    }
                    set(uiSchema, fieldPath, fieldValue);
                }
            }
            else if (typeof fieldValue === 'undefined' || fieldValue === false) {
                // Should not be called.
                // Removes any config that might have been copied over to uiSchema.
                // unset(uiSchema, fieldPath);
                console.error("Schema property for this is undefined: ", schemaFieldPath, fieldValue);
                // unset(schema.properties, schemaFieldPath);
                //set(uiSchema, fieldPath, ui-order)
            }
            else if (~fieldPath.indexOf("required") && typeof fieldValue === "boolean") { // overriding required.
                // console.log("setting ", fieldPath, schemaFieldPath);
                set(schema.properties, schemaFieldPath, fieldValue);
            }
            else if (typeof fieldValue == "boolean") { // including or excluding a field.
            }
            else {
                console.log("setting ", fieldPath, schemaFieldPath, fieldValue);
                set(schema.properties, schemaFieldPath, fieldValue);
            }
        }
        for (let fn of toSetAtEnd)
            fn();

        // allows attrs like "type" to be shown
        /*schema = merge({}, schemaModifier, schema);
        let flattenedKeys = Object.keys(flatten(schema)).filter(k => !isUiSchemaPath(k));
        schema = pick(schema, flattenedKeys);*/

        // filterUiSchema(uiSchema);
        console.log("new schema", schema, "uischema", uiSchema);
        console.log("paymentCalcInfo", paymentCalcInfo);
        let res: IResult = null;
        if (isEditingResponse) {
            // When editing responses
            res = { responseLoaded: data.responseLoaded, schemaMetadata, uiSchema, schema, paymentCalcInfo, validationInfo, focusUpdateInfo, dataOptions };
        }
        else {
            // When making a brand new response.
            res = { schemaMetadata, uiSchema, schema, defaultFormData, paymentCalcInfo, validationInfo, focusUpdateInfo, dataOptions };
        }
        return res;
    }
}
export default CreateSchemas;