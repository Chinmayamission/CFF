import { assign, concat, isArray } from 'lodash-es';
import * as React from 'react';
import { CSVLink } from 'react-csv';
import { connect } from 'react-redux';
import { NavLink } from "react-router-dom";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Headers from "src/admin/util/Headers";
import Loading from "src/common/Loading/Loading";
import { fetchRenderedForm } from '../../store/form/actions';
import { fetchResponses, setFormResponseTableDisplayData } from '../../store/responses/actions';
import filterHeaderObjs from "./filterHeaderObjs";
import ResponseDetail from "./ResponseDetail";
import { IResponseTableProps, IResponseTableState } from "./ResponseTable.d";
import { IFormResponseTableDisplayData } from '../../store/responses/types';
import { filterCaseInsensitive } from "./filters";

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;

class ResponseTable extends React.Component<IResponseTableProps, IResponseTableState> {
    static defaultProps = {
        editMode: false,
        checkinMode: false
    }

    componentDidMount() {
        this.props.fetchRenderedForm(this.props.match.params.formId).then(e =>
            this.props.fetchResponses(this.props.match.params.formId));
    }

    showUnwindTable(rowToUnwind) {
        if (!rowToUnwind) {
            rowToUnwind = this.props.rowToUnwind;
        }
        let origData = this.props.tableDataOrigObject.map(e => e.value);
        let data = [];
        for (let item of origData) {
            if (!item[rowToUnwind]) continue;
            for (let i in item[rowToUnwind]) {
                // Gives all data of original rows to the unwound item.
                let unwoundItem = item[rowToUnwind][i];
                unwoundItem = assign({}, item, unwoundItem);
                unwoundItem["CFF_UNWIND_PATH"] = `${rowToUnwind}.${i}`;
                data.push(unwoundItem);
            }
        }
        let headerObjs = concat(
            // Headers.makeHeaderObjsFromKeys(["ID", "PAID"]),
            Headers.makeHeaders(this.props.form.renderedForm.schema.properties[rowToUnwind].items.properties),
            this.props.tableHeaders // concat original table headers with this.
        );
        let dataOptions = this.props.form.renderedForm.dataOptions;
        let colsToAggregate = [];
        if (dataOptions.unwindTables && dataOptions.unwindTables[rowToUnwind]) {
            headerObjs = filterHeaderObjs(headerObjs, dataOptions.unwindTables[rowToUnwind]);
            colsToAggregate = this.getColsToAggregate(dataOptions.unwindTables[rowToUnwind]);
        }

        this.props.setFormResponseTableDisplayData({
            tableDataDisplayed: data,
            tableHeadersDisplayed: headerObjs,
            colsToAggregate,
            tableHeaders: this.props.tableHeaders,
            tableData: this.props.tableData,
            possibleFieldsToUnwind: this.props.possibleFieldsToUnwind,
            dataOptions: this.props.dataOptions,
            rowToUnwind: rowToUnwind,
            tableDataOrigObject: this.props.tableDataOrigObject
        });
    }
    getColsToAggregate(dataOption) {
        if (dataOption && dataOption.aggregateCols && dataOption.aggregateCols.length && isArray(dataOption.aggregateCols)) {
            return dataOption.aggregateCols;
        }
        return [];
    }

    showResponsesTable() {
        // Show "regular" response table, one row per response.
        this.props.setFormResponseTableDisplayData({
            tableDataDisplayed: this.props.tableData,
            tableHeadersDisplayed: this.props.tableHeaders,
            rowToUnwind: "",
            colsToAggregate: this.props.colsToAggregate,
            tableHeaders: this.props.tableHeaders,
            tableData: this.props.tableData,
            possibleFieldsToUnwind: this.props.possibleFieldsToUnwind,
            dataOptions: this.props.dataOptions,
            tableDataOrigObject: this.props.tableDataOrigObject
        });

    }

    render() {
        return (!this.props.responses || !this.props.form || !this.props.tableDataDisplayed) ? <Loading /> : (
            <ReactTable
                data={this.props.tableDataDisplayed}
                columns={this.props.tableHeadersDisplayed}
                minRows={0}
                filterable
                //pivotBy={this.props.pivotCols}
                defaultSorted={this.props.rowToUnwind ? [] : [{ "id": "DATE_LAST_MODIFIED", "desc": true }]}
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
            >
                {(state, makeTable, instance) => {
                    return (
                        <div>
                            {!this.props.checkinMode && <div>
                                <ul className="nav nav-pills">
                                    <li onClick={() => this.showResponsesTable()} className="nav-item">
                                        <NavLink className="nav-link" to={{ pathname: `all` }}>
                                            All Responses
                                    </NavLink>
                                    </li>
                                    {this.props.possibleFieldsToUnwind.map(e =>
                                        <li className="nav-item" key={e} onClick={() => this.showUnwindTable(e)}>
                                            <NavLink className="nav-link" to={{ pathname: e }}>
                                                Unwind by {e}
                                            </NavLink>
                                        </li>
                                    )}
                                </ul>
                                <CSVLink
                                    data={state.sortedData.map(e => {
                                        for (let header of this.props.tableHeadersDisplayed) {
                                            if (typeof e[header.key] == 'undefined') {
                                                e[header.key] = "";
                                            }
                                            if (typeof e[header.key] == 'string') {
                                                e[header.key] = e[header.key].replace(/\n/g, "  ");
                                            }
                                        }
                                        return e;
                                    })}
                                    headers={this.props.tableHeadersDisplayed}>
                                    <button className="btn btn-outline-primary">Download CSV</button>
                                </CSVLink>
                            </div>}
                            {makeTable()}
                        </div>
                    )
                }}
            </ReactTable>
        );

    }
}

const mapStateToProps = state => ({
    ...state.responses,
    form: state.form
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchResponses: formId => dispatch(fetchResponses(formId)),
    fetchRenderedForm: formId => dispatch(fetchRenderedForm(formId)),
    setFormResponseTableDisplayData: (e: IFormResponseTableDisplayData) => dispatch(setFormResponseTableDisplayData(e))
});

export default connect(mapStateToProps, mapDispatchToProps)(ResponseTable);