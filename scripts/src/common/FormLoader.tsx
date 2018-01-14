/// <reference path="./common.d.ts"/>
import axios from 'axios';
import * as deref from "json-schema-deref-sync";
import {flatten} from 'flat';
import SchemaUtil from "src/common/util/SchemaUtil";
import MockData from "src/common/util/MockData";
import {set, unset, merge, pick, filter} from 'lodash-es';

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
    
    // Applies schema modifier attributes to uiSchema and schema.
    for (let fieldPath in flattenedSchemaModifier) {
        let fieldValue = flattenedSchemaModifier[fieldPath];
        let schemaFieldPath = SchemaUtil.objToSchemaPath(fieldPath);
        if (~["title", "description"].indexOf(fieldPath)) {
            // Top-level modifications.
            schema[fieldPath] = fieldValue;
        }
        else if (isUiSchemaPath(fieldPath)) {
            set(uiSchema, fieldPath, fieldValue);
        }
        else if (!fieldValue) {
            unset(schema.properties, schemaFieldPath);
        }
        else if (typeof fieldValue == "boolean") {
        }
        else {
            console.log("setting ", fieldPath, schemaFieldPath);
            set(schema.properties, schemaFieldPath, fieldValue);
        }
    }

    // allows attrs like "type" to be shown
    /*schema = merge({}, schemaModifier, schema);
    let flattenedKeys = Object.keys(flatten(schema)).filter(k => !isUiSchemaPath(k));
    schema = pick(schema, flattenedKeys);*/
    
    // filterUiSchema(uiSchema);
    console.log("new schema", schema, "uischema", uiSchema);
    if (data["responseLoaded"]) {
        // When editing responses
        return { responseLoaded: data.responseLoaded, schemaMetadata, uiSchema, schema };
    }
    else {
        // When just editing a form
        return { schemaMetadata, uiSchema, schema };
    }
}

export module FormLoader {
    export function getForm(apiEndpoint, formId, responseId=null) {
        let url = apiEndpoint + "?action=" + "formRender" + "&version=1&id=" + formId;
        if (responseId) {
            url += "&resid=" + responseId;
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
        return this.getForm(apiEndpoint, formId, responseId).then(createSchemas).catch(handleError);
    }

}

export default FormLoader;