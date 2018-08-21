import * as React from 'react';
import { assign, get, cloneDeep, find } from "lodash-es";
import { IDataOptionView, IGroupOption } from '../FormEdit/FormEdit.d';
import { Schema } from '../../form/interfaces';
import { isArray } from 'util';
import { Object } from 'core-js';
import { dataToSchemaPath } from './SchemaUtil';
import Form from "react-jsonschema-form";
import CustomForm from '../../form/CustomForm';

export interface IHeaderObject {
    Header: string,
    id: string,
    accessor: (e: any) => any,
    Cell: (e: any) => any,
    filterMethod?: (a, b) => any,
    Filter?: ({ filter, onChange }) => any,
    headerClassName?: string
}

export interface IHeaderOption {
    label?: string,
    value: string,
    groupAssign?: string
}

export module Headers {

    export function makeHeaderObjsFromKeys(keys, schema, groups: IGroupOption[]) {
        // Add a specified list of headers.
        let headerObjs = [];
        for (let header of keys) {
            headerObjs.push(Headers.makeHeaderObj(header, schema, groups));
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
                if (value.match(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/)) {
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
        if (typeof value !== "undefined") {
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
        const headerNameList = headerName.split(" ").map(e => headerAccessorSingle(formData, e, schema));
        if (headerNameList.length === 1) {
            return headerNameList[0];
        }
        else {
            return headerNameList.join(" ");
        }
    }

    export function makeHeaderObj(header: IHeaderOption, schema: any, groups: IGroupOption[]) {
        let headerName = "" + (header.value || header);
        let headerLabel = "" + (header.label || headerName.replace(/^([a-z])/, t => t.toUpperCase()));
        // Makes a single header object.
        let headerObj: IHeaderObject = {
            // For react table js:
            Header: headerLabel,
            id: headerName,
            accessor: formData => headerAccessor(formData, headerName, schema),
            Cell: row => formatValue(row.value)
        };
        if (header.groupAssign) {
            const currentGroup = find(groups, { "id": header.groupAssign });
            if (currentGroup && currentGroup.data) {
                // const path = dataToSchemaPath(headerName, schema);
                const selectSchema = {
                    "type": "string",
                    "enum": currentGroup.data.map(g => g.id),
                    "enumNames": currentGroup.data.map(g => g.displayName || g.id)
                };

                const selectSchemaFilter = cloneDeep(selectSchema);
                selectSchemaFilter.enum.unshift("All");
                selectSchemaFilter.enumNames.unshift("All");
                headerObj.headerClassName = "ccmt-cff-no-click";
                headerObj.Cell = row =>
                    <Form schema={selectSchema} uiSchema={{}} formData={row.value}
                    // onChange={e => onAssign(row.value)}
                    >
                        <div className="d-none"></div>
                    </Form>;
                headerObj.filterMethod = (filter, row) => {
                    if (filter.value == "All") {
                        return true;
                    }
                    return get(row, filter.id) == filter.value;
                }
                headerObj.Filter = ({ filter, onChange }) =>
                    <Form schema={selectSchemaFilter} uiSchema={{}} formData={"All"}
                        onChange={e => onChange(e.formData)}>
                        <div className="d-none"></div>
                    </Form>;
            }
        }

        if (headerName == "PAID") {
            headerObj = assign(headerObj, {
                "filterMethod": (filter, row) => {
                    if (filter.value === "all") {
                        return true;
                    }
                    if (filter.value === "paid") {
                        return row.PAID === true;
                    }
                    return row.PAID === false;
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

    export function makeHeadersFromDataOption(dataOptionView: IDataOptionView, schema: Schema, groups: IGroupOption[] = []) {
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
        const headerObjs = makeHeaderObjsFromKeys(columns, schema, groups);
        return headerObjs;
    }


}

export default Headers;