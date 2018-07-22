/// <reference path="./ResponseTable.d.ts"/>
import * as React from 'react';
import 'react-table/react-table.css';
import ReactTable from 'react-table';
import {assign, concat, get, isArray, find, filter, set} from 'lodash-es';
import {CSVLink} from 'react-csv';
import FormLoader from "src/common/FormLoader";
import Headers from "src/admin/util/Headers";
import {API} from "aws-amplify";
import Loading from "src/common/Loading/Loading";
import ResponseDetail from "./ResponseDetail";
import InlineEdit from "react-edit-inline";
import filterHeaderObjs from "./filterHeaderObjs";
import { NavLink } from "react-router-dom";
import {flatten} from 'flat';

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;

const filterCaseInsensitive = (filter, row) => {
    const id = filter.pivotId || filter.id;
    if (row[id] !== null){
        return (
            row[id] !== undefined ?
                String(row[id]).toLowerCase().startsWith(filter.value.toLowerCase())
                :
                true
        );
    }
};

class ResponseTable extends React.Component<IResponseTableProps, IResponseTableState> {
    static defaultProps = {
        editMode: false,
        checkinMode: false
    }
    constructor(props:any) {
        super(props);
        this.state = {
            status: STATUS_RESPONSES_LOADING,
            tableData: null,
            tableDataOrigObject: null,
            tableDataDisplayed: null,
            tableHeadersDisplayed: null,
            tableHeaders: null,
            pivotCols: [],
            schema: null,
            possibleFieldsToUnwind: null,
            rowToUnwind: null,
            colsToAggregate: [],
            dataOptions: null,
            loading: true,
            hasError: false
        }
    }
    formatPayment(total, currency="USD") {
        if (!total) total = 0;
        if (Intl && Intl.NumberFormat) {
            return Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(total);
        }
        else {
            return total + " " + currency;
        }
    }
    setRow(row, value, valueToAssign, headerNamesToShow) {
        valueToAssign[row] = value;
        if (!~headerNamesToShow.indexOf(row))
            headerNamesToShow.push(row);
    }
    onLoadStart() {
        this.setState({"loading": true});
    }
    onLoadEnd() {
        this.setState({"loading": false});
    }
    onError(e) {
        alert("Error: " + e);
        console.error(e);
        this.setState({hasError: true});
    }

    componentDidMount() {
        this.onLoadStart();
        FormLoader.getFormAndCreateSchemas("", this.props.match.params.formId, "", [""], e => this.onError(e)).then(({ schema, dataOptions }) => {
            this.setState({
                schema, dataOptions
            });
        })
        .then(() => API.get("CFF", "forms/" + this.props.match.params.formId + "/responses", {}))
        .then(e => e.res)
        // .then(data => data.filter(e => typeof e === "object" && e.value))
        .then(data => {
            // data = data.sort((a,b) => Date.parse(a.date_created) - Date.parse(b.date_created));
            let headerNamesToShow = ["DATE_LAST_MODIFIED", "DATE_CREATED", "PAYMENT_INFO_TOTAL"];
            data = data.sort((a,b) => Date.parse(a.date_created) - Date.parse(b.date_created));
            
            let propertyHeaders = [];
            for (let item of data) {
                for (let i in flatten(item.value)) {
                    if (!~propertyHeaders.indexOf(i)) {
                        propertyHeaders.push(i);
                    }
                }
            }

            data = data.map((e, index) => {
                let valueToAssign = {
                    "ID": e["_id"]["$oid"],
                    "PAID": e.paid,
                    "PAYMENT_HISTORY": e.PAYMENT_HISTORY,
                    "IPN_HISTORY": e.IPN_HISTORY,
                    "DATE_CREATED": e.date_created.$date,
                    // "NUMERIC_ID": index + 1,
                    "DATE_LAST_MODIFIED": e.date_modified.$date,
                    "PAYMENT_INFO_TOTAL": this.formatPayment(e.paymentInfo.total, e.paymentInfo.currency),
                    "UPDATE_HISTORY": e.UPDATE_HISTORY,
                    //"PAYMENT_INFO_ITEMS": '"' + JSON.stringify(e.paymentInfo.items) + '"',
                    "CONFIRMATION_EMAIL_INFO": e.confirmationEmailInfo
                };
                assign(e.value, valueToAssign);
                this.setState({tableDataOrigObject: data});
                return e.value;
            });
            let dataOptions = this.state.dataOptions;
            let colsToAggregate = [];
            let tableName = this.props.checkinMode ? "checkinTable" : "mainTable";

            let defaultHeaders = concat(
                ["ID", "PAID"],
                propertyHeaders,
                headerNamesToShow
            );
            let headerObjs = Headers.makeHeaderObjsFromKeys(
                get(this.state.dataOptions, `${tableName}.columnOrder`, defaultHeaders)
            );

            // if (dataOptions[tableName]) {
            //     headerObjs = filterHeaderObjs(headerObjs, dataOptions[tableName]);
            //     colsToAggregate = this.getColsToAggregate(dataOptions[tableName]);
            // }
            
            // Set possible rows to unwind, equal to top-level array items.
            let possibleFieldsToUnwind = [];
            if (dataOptions.unwindTables) {
                possibleFieldsToUnwind = Object.keys(dataOptions.unwindTables);
            }
            else {
                for (let fieldName in this.state.schema.properties) {
                    let fieldValue = this.state.schema.properties[fieldName];
                    if (fieldValue.type == "array") {
                        possibleFieldsToUnwind.push(fieldName);
                        dataOptions[fieldName] = {};
                    }
                }
            }
            
            this.setState({
                tableHeaders: headerObjs, tableHeadersDisplayed: headerObjs,
                tableData: data, tableDataDisplayed: data,
                status: STATUS_RESPONSES_RENDERED,
                possibleFieldsToUnwind,
                dataOptions,
                colsToAggregate
            }, () => {
                if (this.props.match.params.tableViewName && this.props.match.params.tableViewName != "all" && this.state.rowToUnwind != this.props.match.params.tableViewName) {
                    this.showUnwindTable(this.props.match.params.tableViewName);
                }
            });
            this.onLoadEnd();
        }).catch(e => this.onError(e));
    }

    showUnwindTable(rowToUnwind) {
        if (rowToUnwind) {
            // If select box was changed.
            this.setState({"rowToUnwind": rowToUnwind});
        }
        else {
            rowToUnwind = this.state.rowToUnwind;
        }
        let origData = this.state.tableDataOrigObject.map(e => e.value);
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
            Headers.makeHeaders(this.state.schema.properties[rowToUnwind].items.properties),
            this.state.tableHeaders // concat original table headers with this.
        );
        let dataOptions = this.state.dataOptions;
        let colsToAggregate = [];
        if (dataOptions.unwindTables && dataOptions.unwindTables[rowToUnwind]) {
            headerObjs = filterHeaderObjs(headerObjs, dataOptions.unwindTables[rowToUnwind]);
            colsToAggregate = this.getColsToAggregate(dataOptions.unwindTables[rowToUnwind]);
        }
        
        this.setState({
            tableDataDisplayed: data,
            tableHeadersDisplayed: headerObjs,
            colsToAggregate
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
        this.setState({"rowToUnwind": ""});
        this.setState({
            tableHeadersDisplayed: this.state.tableHeaders,
            tableDataDisplayed: this.state.tableData
        });
    }
    onResponseEdit(elementAccessor, value, {index, original}) {
        let path = `${original.CFF_UNWIND_PATH || ""}.${elementAccessor}`;
        let responseId = original.ID;

        let tableDataDisplayed = this.state.tableDataDisplayed;
        let selectedRow = tableDataDisplayed[index];
        if (selectedRow) {
            selectedRow["CFF_REACT_TABLE_STATUS"] = "updating";
            this.setState({tableDataDisplayed});
        }

        console.log(`Setting ${responseId}'s ${path} to ${value}.`);
        API.patch("CFF", `responses/${responseId}/edit`, {
            "body":
            {
                "path": `value.${path}`,
                "value": value
            }
        }).then(e => {
            console.log("Response update succeeded", e);
            selectedRow && (selectedRow["CFF_REACT_TABLE_STATUS"] = "");
            let tableDataOrigObject = this.state.tableDataOrigObject;
            let tableData = this.state.tableData;
            let tableDataDisplayed = this.state.tableDataDisplayed;
            set(find(tableDataOrigObject, {"responseId": responseId}), `value.${path}`, value);
            set(find(tableData, {"responseId": responseId}), path, value);
            set(selectedRow, elementAccessor, value);
            // Todo: use index for faster.
            this.setState({tableDataOrigObject, tableData, tableDataDisplayed});
        }).catch(e => {
            alert(`Response update failed: ${e}`);
            console.error(e);
        })
    }
    makeHeaderEditable(header) {
        header.Cell = row => (<div>
            <InlineEdit text={"" + (row.value || "None") } paramName="value" change={({value}) => this.onResponseEdit(header.accessor, value, row)} />
        </div>);
        return header;
    }

    render() {
        return this.state.loading ? <Loading hasError={this.state.hasError} /> : (
            <ReactTable
            data={this.state.tableDataDisplayed}
            columns={this.state.tableHeadersDisplayed.map(e => this.props.editMode ? this.makeHeaderEditable(e): e)}
            minRows={0}
            filterable
            //pivotBy={this.state.pivotCols}
            defaultSorted = { this.state.rowToUnwind ? [] : [{"id": "DATE_LAST_MODIFIED", "desc": true}] }
            defaultFiltered= { [{"id": "PAID", "value": "paid"}] }
            defaultFilterMethod={filterCaseInsensitive}
            freezeWhenExpanded={true}
            SubComponent={ ({original, row}) => <ResponseDetail checkInMode={this.props.checkinMode} responseId={original.ID} formId={this.props.match.params.formId} dataOptions={this.state.dataOptions} /> }
            getTrProps={(state, rowInfo, column) => {
                return {
                  style: {
                    color: rowInfo.row["CFF_REACT_TABLE_STATUS"] == "updating" ? 'grey' : 'black'
                  }
                }
              }
            }>
            {(state, makeTable, instance) => {
                return (
                    <div>
                        {!this.props.checkinMode && <div>
                            <ul className="nav nav-pills">
                                <li onClick={() => this.showResponsesTable()} className="nav-item">
                                    <NavLink className="nav-link" to={{pathname: `all` }}>
                                        All Responses
                                    </NavLink>
                                </li>
                                {this.state.possibleFieldsToUnwind.map(e => 
                                    <li className="nav-item" key={e} onClick={() => this.showUnwindTable(e)}>
                                        <NavLink className="nav-link" to={{pathname: e }}>
                                            Unwind by {e}
                                        </NavLink>
                                        
                                    </li>
                                )}
                            </ul>
                            <CSVLink
                                data={state.sortedData.map(e=> {
                                    for (let header of this.state.tableHeadersDisplayed) {
                                        if (typeof e[header.key] == 'undefined') {
                                            e[header.key] = "";
                                        }
                                        if (typeof e[header.key] == 'string') {
                                            e[header.key] = e[header.key].replace(/\n/g, "  ");
                                        }
                                    }
                                    return e;
                                })}
                                headers={this.state.tableHeadersDisplayed}>
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

export default ResponseTable;