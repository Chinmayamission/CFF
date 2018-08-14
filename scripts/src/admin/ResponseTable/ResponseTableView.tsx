import { push } from "connected-react-router";
import unwind from "javascript-unwind";
import { find, get, set } from "lodash-es";
import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from "react-router-dom";
import ReactTable from "react-table";
import { IResponse } from '../../store/responses/types';
import { IDataOptions, IRenderedForm } from '../FormEdit/FormEdit.d';
import Headers from "../util/Headers";
import downloadCSV from "./downloadCSV";
import { filterCaseInsensitive } from "./filters";
import ResponseDetail from "./ResponseDetail";

interface IReactTableViewProps {
    responses: IResponse[],
    renderedForm: IRenderedForm,
    tableViewName: string,
    push: (e: string) => void
}


export default (props: IReactTableViewProps) => {
    // let headers = Headers.makeHeaderObjsFromKeys(["ID", "PAID", "DATE_CREATED"]);
    const defaultDataOptions: IDataOptions = {
        "views": [{
            "id": "all",
            "displayName": "All View"
        }]
    };
    let dataOptions: IDataOptions = get(props.renderedForm.formOptions, "dataOptions.views") ? props.renderedForm.formOptions.dataOptions : defaultDataOptions;
    for (let i in dataOptions.views) {
        let view = dataOptions.views[i];
        if (!view.displayName) {
            view.displayName = view.unwindBy ? `Unwind by ${view.unwindBy}` : "All responses";
        }
        if (!view.id) {
            view.id = "view" + i;
        }
    }
    const dataOptionView = find(dataOptions.views, { "id": props.tableViewName });
    if (!props.tableViewName) {
        // Redirect to first view on default.
        props.push(dataOptions.views[0].id);
    }

    let headers = [];
    let data = props.responses;
    if (dataOptionView) {
        headers = Headers.makeHeadersFromDataOption(dataOptionView, props.renderedForm.schema);
        if (dataOptionView.unwindBy) {
            for (let item of data) {
                if (!get(item, dataOptionView.unwindBy)) {
                    set(item, dataOptionView.unwindBy, []);
                }
            }
            data = unwind(data, dataOptionView.unwindBy);
        }
    }
    return (<div>
        <ul className="nav nav-pills">
            {dataOptions.views.map(e =>
                <li className="nav-item btn-outline-primary" key={e.id}>
                    <a className="nav-link" onClick={() => props.push(e.id)}>
                        {e.displayName}
                    </a>
                </li>
            )}
        </ul>
        <button className="btn btn-outline-primary" onClick={() => downloadCSV(headers, data, `Responses - ${props.renderedForm.name} - at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`)}>Download CSV</button>

        {dataOptionView && <ReactTable
            data={data}
            columns={headers}
            minRows={0}
            filterable
            //pivotBy={props.pivotCols}
            defaultSorted={[{ "id": "DATE_LAST_MODIFIED", "desc": true }]}
            defaultFiltered={[{ "id": "PAID", "value": "all" }]}
            defaultFilterMethod={filterCaseInsensitive}
            freezeWhenExpanded={true}
            SubComponent={({ original, row }) => <ResponseDetail responseId={original.ID} />}
            getTrProps={(state, rowInfo, column, instance) => {
                return {
                    style: {
                        color: rowInfo.row["CFF_REACT_TABLE_STATUS"] == "updating" ? 'grey' : 'black'
                    },
                    onClick: (e) => {
                        const { expanded } = state;
                        const path = rowInfo.nestingPath[0];

                        instance.setState({
                            expanded: { [path]: expanded[path] ? false : true }
                        });
                    }
                }
            }
            }
        />}
        {!dataOptionView && <div>No view selected. Please select a view to continue.</div>}
    </div>
    );
}