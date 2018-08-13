import React from 'react';
import ReactTable from "react-table";
import ResponseDetail from "./ResponseDetail";
import { filterCaseInsensitive } from "./filters";
import { CSVLink } from 'react-csv';
import { NavLink } from "react-router-dom";
import { IDataOptions, IFormDBEntry, IRenderedForm, IDataOptionView } from '../FormEdit/FormEdit.d';
import { IResponse } from '../../store/responses/types';
import { connect } from 'react-redux';
import Headers from "../util/Headers";
import { get, set, find } from "lodash-es";
import { push } from "connected-react-router";
import unwind from "javascript-unwind";

interface IReactTableViewProps {
    responses: IResponse[],
    renderedForm: IRenderedForm,
    tableViewName: string,
    push: (e: string) => void
}

let ResponseTableView = (props: IReactTableViewProps) => {
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
                <li className="nav-item" key={e.id}>
                    <NavLink className="nav-link" to={`./${e.id}`}>
                        {e.displayName}
                    </NavLink>
                </li>
            )}
        </ul>
        {/* <CSVLink
                            data={state.sortedData.map(e => {
                                for (let header of headers) {
                                    if (typeof e[header.key] == 'undefined') {
                                        e[header.key] = "";
                                    }
                                    if (typeof e[header.key] == 'string') {
                                        e[header.key] = e[header.key].replace(/\n/g, "  ").replace(/\"/g, "");
                                    }
                                }
                                return e;
                            })}
                            headers={headers}>
                            <button className="btn btn-outline-primary">Download CSV</button>
                        </CSVLink> */}

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
            filename={`${props.renderedForm.name}-${new Date().getTime()}.csv`}
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

const mapStateToProps = state => ({
    responses: state.responses.responses,
    renderedForm: state.form.renderedForm,
    tableViewName: (state.router.location.pathname.match(/\/(.[a-zA-Z_]*?)$/) || [null, null])[1]
});

const mapDispatchToProps = (dispatch) => ({
    push: (e: string) => dispatch(push(`./${e}`))
});

export default connect(mapStateToProps, mapDispatchToProps)(ResponseTableView);