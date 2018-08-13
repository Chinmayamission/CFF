import * as React from 'react';
import { assign, get } from "lodash-es";
import { IDataOptionView } from '../FormEdit/FormEdit.d';
import { Schema } from '../../form/interfaces';
import { isArray } from 'util';
import { Object } from 'core-js';

export interface IHeaderObject {
    Header: string,
    id: string,
    accessor: (e: any) => any,
    Cell: (e: any) => any
}

export module Headers {

    export function makeHeaders(schemaProperties, headerObjs = []) {
        Headers.makeHeadersHelper(schemaProperties, headerObjs);
        return headerObjs;
    }
    export function makeHeadersHelper(schemaProperties, headerObjs, prefix = "") {
        for (let header in schemaProperties) {
            if (schemaProperties[header]["type"] == "object") {
                Headers.makeHeadersHelper(schemaProperties[header]["properties"], headerObjs, header);
                continue;
            }
            else if (schemaProperties[header]["type"] == "array") {
                continue;
            }
            // Label according to schema's title.
            let headerLabel = get(schemaProperties, header).title || header;
            header = prefix ? prefix + "." + header : header;
            headerObjs.push(Headers.makeHeaderObj(header, headerLabel));
        }
    }

    export function makeHeaderObjsFromKeys(keys) {
        // Add a specified list of headers.
        let headerObjs = [];
        for (let header of keys) {
            if (header.label && header.value) {
                headerObjs.push(Headers.makeHeaderObj(header.value, header.label));
            }
            else {
                headerObjs.push(Headers.makeHeaderObj(header));
            }
        }
        return headerObjs;
    }
    /*
     * Format a value for display on the header table.
     */
    export function formatValue(value) {
        switch (typeof value) {
            case "boolean":
                return value ? "YES" : "NO";
            case "object":
                return JSON.stringify(value);
            case "string":
                if (value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/)) {
                    let date = new Date(value);
                    if (date.getDate()) {
                        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
                    }
                }
            default:
                return value;
        }
    }

    function formatObj(value) {
        if (typeof value === "object") {
            return Object.values(value).join(" ");
        }
        return value;
    }

    function headerAccessorSingle(formData, headerName, schema) {
        let value = get(formData, headerName);
        if (value) {
            return value;
        }
        let components = headerName.split(".");
        if (components.length >= 2 && get(schema.properties, `${components[0]}.type`) == "array") {
            const arrayPath = components[0];
            components.shift();
            const arrayAccessor = components.join(".");
            if (isArray(get(formData, arrayPath))) {
                return get(formData, arrayPath).map(e => formatObj(get(e, arrayAccessor))).join(", ");
            }
            else {
                // if unwindBy value, just revert to the original value.
                return value;
            }
        }
        return "";
    }

    export function headerAccessor(formData, headerName, schema) {
        const headerNameList = headerName.split(" ");
        return headerNameList.map(e => headerAccessorSingle(formData, e, schema)).join(" ");
    }

    export function makeHeaderObj(headerName, headerLabel = "") {
        headerName = headerName + "";
        if (!headerLabel) {
            headerLabel = headerName.replace(/^([a-z])/, t => t.toUpperCase());
        }
        // Makes a single header object.
        let headerObj: IHeaderObject = {
            // For react table js:
            Header: headerLabel,
            id: headerName,
            accessor: formData => headerLabel,
            Cell: row => formatValue(row.value)
        };

        if (headerName == "PAID") {
            headerObj = assign(headerObj, {
                "filterMethod": (filter, row) => {
                    if (filter.value === "all") {
                        return true;
                    }
                    if (filter.value === "paid") {
                        return row[filter.id] === true;
                    }
                    return row[filter.id] === false; // || row[filter.id] == false;
                },
                "Filter": ({ filter, onChange }) =>
                    (<select
                        onChange={event => onChange(event.target.value)}
                        style={{ width: "100%" }}
                        value={filter ? filter.value : "all"}
                    >
                        <option value="paid">Paid</option>
                        <option value="notpaid">Not Paid</option>
                        <option value="all">Show All</option>
                    </select>)
            });
        }
        return headerObj;
    }

    function getHeaderNamesFromSchemaHelper(schemaProperties, headerNames, prefix = "") {
        for (let key in schemaProperties) {
            // if (key == "type" || key == "properties" || !schemaProperties[key]) {
            //     continue;
            // }
            if (schemaProperties[key].type == "object") {
                getHeaderNamesFromSchemaHelper(schemaProperties[key].properties, headerNames, key);
                continue;
            }
            else if (schemaProperties[key].type == "array") {
                continue;
            }
            let headerName = prefix ? prefix + "." + key : key;
            headerNames.push(headerName);
        }
    }

    function getHeaderNamesFromSchema(schema) {
        let headerNames = [];
        getHeaderNamesFromSchemaHelper(schema.properties, headerNames);
        return headerNames;
    }

    export function makeHeadersFromDataOption(dataOptionView: IDataOptionView, schema: Schema) {
        let columns = dataOptionView.columns;

        if (!columns) {
            columns = ["ID", "PAID", "DATE_CREATED"].concat(getHeaderNamesFromSchema(schema));
            if (dataOptionView.unwindBy) {
                // todo: fix property path.
                let unwindBySchema = get(schema, dataOptionView.unwindBy);
                if (unwindBySchema && unwindBySchema.type == "object") {
                    columns = columns.concat(getHeaderNamesFromSchema(unwindBySchema).map(e => `${dataOptionView.unwindBy}.${e}`));
                }
            }
        }
        const headerObjs = makeHeaderObjsFromKeys(columns).map(e => {
            e.accessor = formData => headerAccessor(formData, e.id, schema);
            return e;
            // e.key = headerAccessor(data, e.id); // todo: how will we deal with csv export???
        });
        return headerObjs;
    }


}

export default Headers;