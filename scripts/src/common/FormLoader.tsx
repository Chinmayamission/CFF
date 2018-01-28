/// <reference path="./common.d.ts"/>
import axios from 'axios';
import * as deref from "json-schema-deref-sync";
import {flatten} from 'flat';
import SchemaUtil from "src/common/util/SchemaUtil";
import MockData from "src/common/util/MockData";
import {set, unset, pick, filter, get} from 'lodash-es';

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

    console.log('orig schema', schema);
    let uiSchema = {};
    
    // Populate uiSchema with uiSchema options specified in the schema,
    // and remove uiSchema.
    let flattenedSchema = flatten(schema);
    let flattenedSchemaModifier = flatten(schemaModifier);
    for (let fieldPath in flattenedSchema) {
        let fieldValue = flattenedSchema[fieldPath];
        let schemaModifierFieldPath = SchemaUtil.objToSchemaModifierPath(fieldPath);
        if (isUiSchemaPath(fieldPath)) {
            // console.log(fieldPath, schemaModifierFieldPath, " is a uischema path");
            unset(schema, fieldPath);
            set(uiSchema, schemaModifierFieldPath, fieldValue);
        }
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
            if (isEditingResponse && ~fieldPath.indexOf(".ui:nonModifiable")) {
                // todo - not working? test. - Set nonModifiable fields to readonly when editing an existing response.
                // console.log("Yes");
                set(uiSchema, fieldPath.replace(".ui:nonModifiable", ".ui:readonly"), fieldValue);
            }
            else {
                set(uiSchema, fieldPath, fieldValue);
            }
            if (~fieldPath.indexOf(".ui:defaultValue")) {
                // lets defaultFormData be filled out by the "ui:defaultValue" attribute
                set(defaultFormData, fieldPath.substring(0, fieldPath.indexOf(".ui:defaultValue")), fieldValue);
            }
        }
        else if (!fieldValue) {
            // Don't include field in schema since it's not in the schemaModifier.
            console.warn("Removing schema property for", schemaFieldPath);
            unset(schema.properties, schemaFieldPath);
            // Remove from ui-order if exists.
            let paths = fieldPath.split(".");
            let propertyName = paths.pop();
            paths.push("ui:order");
            let uiOrder = get(uiSchema, paths.join("."));
            if (uiOrder && uiOrder.length) {
                let index = uiOrder.indexOf(propertyName);
                if (index > -1) {
                    console.warn("Removing ui:order property for", propertyName);
                    uiOrder.splice(index, 1);
                }
                //
            }
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
    if (isEditingResponse) {
        // When editing responses
        return { responseLoaded: data.responseLoaded, schemaMetadata, uiSchema, schema };
    }
    else {
        // When making a brand new response.
        return { schemaMetadata, uiSchema, schema, defaultFormData };
    }
}

export module FormLoader {
    export function getForm(apiEndpoint, formId, opts) {
        // todo: maybe allow to get different versions?
        let url = apiEndpoint + "?action=" + "formRender" + "&version=1&id=" + formId;
        if (opts) {
            if (opts.responseId) {
                url += "&resid=" + opts.responseId;
            }
            if (opts.include_s_sm_versions) {
                url += "&include_s_sm_versions=" + opts.include_s_sm_versions;
            }
        }
        return  axios.get(url, { "responseType": "json" })
        .catch(e => {
            if ((window as any).CCMT_CFF_DEVMODE===true) {
                return MockData.formRender;
            }
            throw ("Error loading the form. " + e);
        })
        .then(response => response.data.res)
        .then(unescapeJSON);
    }
    export function getFormAndCreateSchemas(apiEndpoint, formId, handleError) {
        return this.getForm(apiEndpoint, formId).then(createSchemas).catch(handleError);
    }
    export function loadResponseAndCreateSchemas(apiEndpoint, formId, responseId, handleError) {
        return this.getForm(apiEndpoint, formId, {"responseId": responseId}).then(createSchemas).catch(handleError);
    }

}

export default FormLoader;