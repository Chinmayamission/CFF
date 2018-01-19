/// <reference path="../admin.d.ts"/>
import * as React from 'react';
import {assign, get} from "lodash-es";

export module Headers {

    export function makeHeaders(schemaProperties, headerObjs=[]) {
        Headers.makeHeadersHelper(schemaProperties, headerObjs);
        return headerObjs;
    }
    export function makeHeadersHelper(schemaProperties, headerObjs, prefix="") {
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
            headerObjs.push(Headers.makeHeaderObj(header));
        }
        return headerObjs;
    }
    
    export function makeHeaderObj(headerName, headerLabel = "") {
        if (!headerLabel) {
            headerLabel = headerName.replace(/^([a-z])/, t => t.toUpperCase());
        }
        // Makes a single header object.
        let headerObj = {
            // For react table js:
            Header: headerLabel,
            id: headerName,
            accessor: headerName,
            // For csv export:
            label: headerLabel,
            key: headerName
        };

        if (headerName == "PAID") {
            headerObj = assign(headerObj, {
                "filterMethod": (filter, row) => {
                    if (filter.value === "all") {
                    return true;
                    }
                    if (filter.value === "paid") {
                    return row[filter.id] == "YES";
                    }
                    return row[filter.id]=="NO"; // || row[filter.id] == false;
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

}

export default Headers;