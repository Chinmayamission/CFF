import React from 'react';
import ReactTable from "react-table";
import ResponseDetail from "./ResponseDetail";
import { filterCaseInsensitive } from "./filters";
import { CSVLink } from 'react-csv';
import { NavLink } from "react-router-dom";
import { IDataOptions } from '../FormEdit/FormEdit.d';
import { IResponse } from '../../store/responses/types';
import { connect } from 'react-redux';
import Headers from "../util/Headers";

interface IReactTableViewProps {
    responses: IResponse[],
    selectedView: string,
    dataOptions: IDataOptions,
    formName: string
}

let ResponseTableView = (props: IReactTableViewProps) => {
    let data = props.responses;
    let headers = Headers.makeHeaderObjsFromKeys(["ID", "PAID", "DATE_CREATED"]);
    return (<ReactTable
        data={data}
        columns={headers}
        minRows={0}
        filterable
        //pivotBy={props.pivotCols}
        defaultSorted={[{ "id": "DATE_LAST_MODIFIED", "desc": true }]}
        defaultFiltered={[{ "id": "PAID", "value": "all" }]}
        defaultFilterMethod={filterCaseInsensitive}
        freezeWhenExpanded={true}
        filename={`${props.formName}-${new Date().getTime()}.csv`}
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
    >
        {(state, makeTable, instance) => {
            return (
                <div>
                    <div>
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <NavLink className="nav-link" to={{ pathname: `all` }}>
                                    All Responses
                            </NavLink>
                            </li>
                            {/* {props.possibleFieldsToUnwind.map(e =>
                        <li className="nav-item" key={e} onClick={() => this.showUnwindTable(e)}>
                            <NavLink className="nav-link" to={{ pathname: e }}>
                                Unwind by {e}
                            </NavLink>
                        </li>
                        )} */}
                            {/* {props.form.renderedForm.dataOptions.views} */}
                        </ul>
                        <CSVLink
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
                        </CSVLink>
                    </div>
                    {makeTable()}
                </div>
            )
        }}
    </ReactTable>);
}

const mapStateToProps = state => ({
    responses: state.responses.responses,
    selectedView: state.responses.selectedView,
    dataOptions: state.form.renderedForm.dataOptions,
    formName: state.form.renderedForm.name
});

const mapDispatchToProps = (dispatch) => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(ResponseTableView);