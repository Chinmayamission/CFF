/// <reference path="./common.d.ts"/>
import axios from 'axios';
import * as deref from "json-schema-deref-sync";

function unescapeJSON(json: {}) {
    /* Un-escapes dollar signs in the json.
     */
    let str = JSON.stringify(json);
    return JSON.parse(JSON.stringify(json).replace(/\\\\u0024/g, "$"));
}

/* Modifies the master schema based on the schemaModifier specific to this form.
 */
function populateSchemaWithOptions(schema, schemaModifier) {
    for (let key in schema) {
        let schemaItem = schema[key];
        // Delete fields & sub-fields of the schema that aren't included in schemaModifiers.
        if (!schemaModifier.hasOwnProperty(key)) {
            if (!~["type", "properties"].indexOf(key)) {
                //console.log("Deleting key " + key);
                delete schema[key];
            }
            continue;
        }
        // Recursively call this function on objects (with properties).
        if (isObject(schemaItem)) {
            if (schemaModifier[key] === Object(schemaModifier[key])) {
                if (schemaItem["properties"])
                    populateSchemaWithOptions(schemaItem["properties"], schemaModifier[key]);
                else // for an object without properties, such as {type: "string", title: "Last Name"}, or {enum: [1,2,3]}
                    overwriteFlatJSON(schemaItem, schemaModifier[key])
            }
        }
        // For everything else (strings, something with an "enum" property)
        else {
            schema[key] = schemaModifier[key];
            //console.log("Replacing for key " + key + ", value " + schemaItem + " => " + schemaModifier[key]);
        }
    }

}

function isObject(obj) {
    return Object(obj) === obj && !Array.isArray(obj)
}

/* Removes keys based on a test function.
 */
function removeKeysBasedOnTest(obj, testFn) {
    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (testFn(i)) {
            //console.log("Not deleting " + i);
            continue;
        }
        else if (isObject(obj[i])) {
            //console.log("checking to filter for object: ", obj, i, obj[i]);
            removeKeysBasedOnTest(obj[i], testFn);
        }
        else {
            delete obj[i];
            //console.log("Deleting " + i);
        }
    }
    return obj;
}

/* Takes old json and replaces its properties with new's properties whenever possible.
*/
function overwriteFlatJSON(oldObj, newObj) {
    for (let i in newObj) {
        oldObj[i] = newObj[i];
    }
}

/* Starting with a schemaModifier,
 * removes all non-"ui:..." keys (and className) from a given uiSchema.
 */
function filterUiSchema(obj) {
    return removeKeysBasedOnTest(obj, (attr) => {
        let searchString = "ui:";
        return attr && (attr.substr(0, searchString.length) === searchString || attr == "classNames");
    });
}

class FormLoader {
    constructor() {
    }
    getForm(apiEndpoint, formId) {
        return axios.get(apiEndpoint + "?action=" + "formRender" + "&id=" + formId, { "responseType": "json" })
        .then(response => response.data.res[0])
        .then(unescapeJSON);
    }
    getFormAndCreateSchemas(apiEndpoint, formId) {
        return this.getForm(apiEndpoint, formId).then(data => {
            var schemaModifier = data["schemaModifier"].value;
            var uiSchema = schemaModifier;
            var schema = data["schema"].value;
            schema = deref(schema);
            schemaModifier = deref(schemaModifier);

            // Allow for top level config (title, description, etc.)
            for (let key in schemaModifier) {
                if (key != "properties" && typeof schemaModifier[key] != "boolean") {
                    console.log("doing for key " + key);
                    schema[key] = schemaModifier[key];
                }
            }

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

            populateSchemaWithOptions(schema.properties, schemaModifier);
            filterUiSchema(uiSchema);
            console.log(schemaModifier, uiSchema, schema);
            return { schemaMetadata, uiSchema, schema };
        });
    }

}

export default FormLoader;