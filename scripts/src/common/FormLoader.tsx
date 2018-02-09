/// <reference path="./common.d.ts"/>
import axios from 'axios';
import * as deref from "json-schema-deref-sync";
import {flatten} from 'flat';
import SchemaUtil from "src/common/util/SchemaUtil";
import MockData from "src/common/util/MockData";
import {set, unset, pick, filter, get} from 'lodash-es';

function removeUiOrder (schemaModifierFieldPath, uiSchema, propertyName) {
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

let createSchemas = data => {
    let isEditingResponse = !!data["responseLoaded"];
    let paymentCalcInfo = data['schemaModifier'].paymentInfo; // Information about payment for purposes of calculation.
    var schemaModifier = data["schemaModifier"].value;
    // var uiSchema = schemaModifier;
    let schema = data["schema"].value;
    schema = deref(schema);
    schemaModifier = deref(schemaModifier);

    // Config of payment schemaModifier in schemaMetadata:
    let schemaMetadata = {};
    let POSSIBLE_METADATA_FIELDS = ["confirmationEmailInfo", "paymentInfo", "paymentMethods"];
    for (let key in data.schema) {
        if (~POSSIBLE_METADATA_FIELDS.indexOf(key))
            schemaMetadata[key] = data.schema[key];
    }
    for (let key in data.schemaModifier) {
        if (~POSSIBLE_METADATA_FIELDS.indexOf(key) && typeof data.schemaModifier[key] != "boolean")
            schemaMetadata[key] = data.schemaModifier[key];
    }

    console.log('orig schema', schema, 'orig schemamodifier', schemaModifier);
    let uiSchema = {};
    
    // Populate uiSchema with uiSchema options specified in the schema,
    // and remove uiSchema attributes in the schema.
    let flattenedSchema = flatten(schema, {safe: true}); // safe: true preserves arrays.
    let flattenedSchemaModifier = flatten(schemaModifier, {safe: true});
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

    // Applies schema modifier attributes to uiSchema and schema.
    for (let fieldPath in flattenedSchemaModifier) {
        let fieldValue = flattenedSchemaModifier[fieldPath];
        // console.log("fp", fieldPath, fieldValue);
        let schemaFieldPath = SchemaUtil.objToSchemaPath(fieldPath);
        if (~["title", "description"].indexOf(fieldPath)) {
            // Top-level modifications.
            schema[fieldPath] = fieldValue;
        }
        else if (isUiSchemaPath(fieldPath)) {
            if (isEditingResponse && ~fieldPath.indexOf(".ui:cff:nonModifiable")) {
                // todo - not working? test. - Set nonModifiable fields to readonly when editing an existing response.
                // console.log("Yes");
                set(uiSchema, fieldPath.replace(".ui:cff:nonModifiable", ".ui:cff:readonly"), fieldValue);
            }
            else {
                set(uiSchema, fieldPath, fieldValue);
            }
            if (~fieldPath.indexOf(".ui:cff:defaultValue")) {
                // lets defaultFormData be filled out by the "ui:defaultValue" attribute
                set(defaultFormData, fieldPath.substring(0, fieldPath.indexOf(".ui:cff:defaultValue")), fieldValue);
            }
        }
        else if (!fieldValue) {
            // Should not be called.
            // Removes any config that might have been copied over to uiSchema.
            // unset(uiSchema, fieldPath);
            console.error("Schema property for this is undefined: ", schemaFieldPath, fieldValue);
            // unset(schema.properties, schemaFieldPath);
            //set(uiSchema, fieldPath, ui-order)
        }
        else if (typeof fieldValue == "boolean") {
        }
        else {
            // console.log("setting ", fieldPath, schemaFieldPath);
            set(schema.properties, schemaFieldPath, fieldValue);
        }
    }

    // allows attrs like "type" to be shown
    /*schema = merge({}, schemaModifier, schema);
    let flattenedKeys = Object.keys(flatten(schema)).filter(k => !isUiSchemaPath(k));
    schema = pick(schema, flattenedKeys);*/
    
    // filterUiSchema(uiSchema);
    console.log("new schema", schema, "uischema", uiSchema);
    console.log("paymentCalcInfo", paymentCalcInfo);
    if (isEditingResponse) {
        // When editing responses
        return { responseLoaded: data.responseLoaded, schemaMetadata, uiSchema, schema, paymentCalcInfo };
    }
    else {
        // When making a brand new response.
        return { schemaMetadata, uiSchema, schema, defaultFormData, paymentCalcInfo };
    }
}

export module FormLoader {
    export function getForm(apiEndpoint, formId, opts) {
        // todo: maybe allow to get different versions?
        let url = apiEndpoint + "?action=" + (opts && opts.apiKey ? "formRenderAdmin": "formRender") + "&version=1&id=" + formId;
        if (opts) {
            if (opts.responseId) {
                url += "&resid=" + opts.responseId;
            }
            if (opts.apiKey) {
                url += "&apiKey=" + opts.apiKey;
            }
        }
        return  axios.get(url, { "responseType": "json" })
        .catch(e => {
            if ((window as any).CCMT_CFF_DEVMODE===true) {
                return MockData.formRender;
            }
            throw ("Error loading the form. " + e);
        })
        .then(response => response.data.res);
        // .then(unescapeJSON);
    }
    export function getFormAndCreateSchemas(apiEndpoint, formId, handleError) {
        return this.getForm(apiEndpoint, formId).then(createSchemas).catch(handleError);
    }
    export function loadResponseAndCreateSchemas(apiEndpoint, formId, responseId, handleError) {
        return this.getForm(apiEndpoint, formId, {"responseId": responseId}).then(createSchemas).catch(handleError);
    }

}

export default FormLoader;