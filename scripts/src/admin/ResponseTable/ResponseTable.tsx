/// <reference path="./ResponseTable.d.ts"/>
import * as React from 'react';
import 'react-table/react-table.css';
import ReactTable from 'react-table';
import ReactJson from 'react-json-view';
import {flatten} from 'flat';
import {assign, concat, groupBy, get, map, keys,
    isArray, intersectionWith, find, union, filter, set} from 'lodash-es';
import {CSVLink} from 'react-csv';
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";
import Headers from "src/admin/util/Headers";
import {API} from "aws-amplify";
import Loading from "src/common/Loading/Loading";
import InlineEdit from "react-edit-inline";

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;

const filterCaseInsensitive = (filter, row) => {
    const id = filter.pivotId || filter.id;
    if (row[id] !== null){
        return (
            row[id] !== undefined ?
                String(row[id].toLowerCase()).startsWith(filter.value.toLowerCase())
                :
                true
        );
    }
};

class ResponseTable extends React.Component<IResponseTableProps, IResponseTableState> {
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
            rowToUnwind: "",
            colsToAggregate: [],
            dataOptions: null,
            loading: false,
            hasError: false
        }
    }
    formatPayment(total, currency="USD") {
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
        this.setState({hasError: true});
    }

    componentWillMount() {
        this.onLoadStart();
        FormLoader.getFormAndCreateSchemas("", this.props.match.params.formId, "", [""], e => this.onError(e)).then(({ schema, dataOptions }) => {
            this.setState({
                schema, dataOptions
            });
        })
        .then(() => API.get("CFF", "forms/" + this.props.match.params.formId + "/responses", {}))
        .then(e => {console.warn("RES", e); return e.res})
        // .then(data => data.filter(e => typeof e === "object" && e.value))
        .then(data => {
            // data = data.sort((a,b) => Date.parse(a.date_created) - Date.parse(b.date_created));
            let headerNamesToShow = ["PAID", "IPN_TOTAL_AMOUNT", "DATE_LAST_MODIFIED", "DATE_CREATED", "PAYMENT_INFO_TOTAL"];
            data = data.map((e, index) => {
                let valueToAssign = {
                    "ID": e.responseId,
                    "PAID": e.PAID ? "YES": "NO",
                    "IPN_TOTAL_AMOUNT": e.IPN_TOTAL_AMOUNT,
                    "PAYMENT_HISTORY": e.PAYMENT_HISTORY,
                    "IPN_HISTORY": e.IPN_HISTORY,
                    "DATE_CREATED": e.date_created,
                    "DATE_LAST_MODIFIED": e.date_last_modified,
                    "PAYMENT_INFO_TOTAL": this.formatPayment(e.paymentInfo.total),
                    "UPDATE_HISTORY": e.UPDATE_HISTORY,
                    //"PAYMENT_INFO_ITEMS": '"' + JSON.stringify(e.paymentInfo.items) + '"',
                    "CONFIRMATION_EMAIL_INFO": e.confirmationEmailInfo
                };
                // todo: what to do when donationAmount and roundOff are specified as different?
                let donationItem = find(e.paymentInfo.items, i => ~i.name.toLowerCase().indexOf("donation") || ~i.name.toLowerCase().indexOf("donation"));
                let hasRoundOff = e.value.roundOff == true;
                if (donationItem) {
                    let roundOffAmount = 0;
                    if (hasRoundOff && e.value.additionalDonation) {
                        // Set round off item equal to the total donation amount minus the "aditional donation"
                        roundOffAmount = donationItem.amount - e.value.additionalDonation;
                        this.setRow("PAYMENT_INFO_ROUNDOFF", this.formatPayment(roundOffAmount), valueToAssign, headerNamesToShow);
                    }
                    this.setRow("PAYMENT_INFO_DONATION", this.formatPayment(donationItem.amount), valueToAssign, headerNamesToShow);
                    this.setRow("PAYMENT_INFO_NON_DONATION", this.formatPayment(e.paymentInfo.total - donationItem.amount - roundOffAmount), valueToAssign, headerNamesToShow);
                }
                assign(e.value, valueToAssign);
                this.setState({tableDataOrigObject: data});
                return e.value;
                //return flatten(e.value);
            });
            
            let paidHeader = Headers.makeHeaderObjsFromKeys(["PAID"]);
            let headerObjs : any = concat(
                paidHeader,
                Headers.makeHeaderObjsFromKeys(["ID"]),
                Headers.makeHeaders(this.state.schema.properties),
                Headers.makeHeaderObjsFromKeys(headerNamesToShow)
                // Headers.makeHeaderObjsFromKeys(["PAYMENT_INFO_TOTAL", "DATE_CREATED", "DATE_LAST_MODIFIED"])
            );
            let dataOptions = this.state.dataOptions;
            let colsToAggregate = [];
            if (dataOptions.mainTable) {
                headerObjs = this.filterHeaderObjs(headerObjs, dataOptions.mainTable);
                colsToAggregate = this.getColsToAggregate(dataOptions.mainTable);
            }
            
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
                // unwoundItem["NUMERIC_ID"] = unwoundItem["NUMERIC_ID"] + "." + (parseInt(i) + 1);
                data.push(unwoundItem);
            }
        }
        let headerObjs = concat(
            // Headers.makeHeaderObjsFromKeys(["ID", "PAID"]),
            // Headers.makeHeaderObjsFromKeys(["NUMERIC_ID"]),
            Headers.makeHeaders(this.state.schema.properties[rowToUnwind].items.properties),
            this.state.tableHeaders // concat original table headers with this.
        );
        let dataOptions = this.state.dataOptions;
        let colsToAggregate = [];
        if (dataOptions.unwindTables && dataOptions.unwindTables[rowToUnwind]) {
            headerObjs = this.filterHeaderObjs(headerObjs, dataOptions.unwindTables[rowToUnwind]);
            colsToAggregate = this.getColsToAggregate(dataOptions.unwindTables[rowToUnwind]);
        }
        
        this.setState({
            tableDataDisplayed: data,
            tableHeadersDisplayed: headerObjs,
            colsToAggregate
        });
    }
    filterHeaderObjs(headerObjs, dataOption) {
        let filtered = [];
        if (dataOption && dataOption.columnOrder && dataOption.columnOrder.length && isArray(dataOption.columnOrder)) {
            filtered = intersectionWith(headerObjs, dataOption.columnOrder, (header, order) => header.id == order);
        }
        if (filtered.length == 0) { // Don't return empty header objs.
            return headerObjs;
        }
        return filtered;
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
        API.post("CFF", `forms/${this.props.match.params.formId}/responses/${responseId}/edit`, {
            "body":
            {
                "path": `value.${path}`,
                "value": value
            }
        }).then(e => {
            console.log("Response update succeeded", e);
            selectedRow["CFF_REACT_TABLE_STATUS"] = "";
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
        })
        // console.log(value, path, row, this.state.tableDataOrigObject);
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
            SubComponent={ this.state.rowToUnwind ? null : DetailView }
            getTrProps={(state, rowInfo, column) => {
                return {
                  style: {
                    color: rowInfo.row["CFF_REACT_TABLE_STATUS"] == "updating" ? 'grey' : 'black'
                  }
                }
              }}
            >
            {(state, makeTable, instance) => {
                // console.log(state, instance);
                return (
                    <div>
                        <button className="btn" onClick={() => this.showResponsesTable()}>View all responses</button>
                        &emsp;Or unwind by:
                        <select value={this.state.rowToUnwind}
                            onChange={(e) => this.showUnwindTable(e.target.value)}>
                            <option key="null" value="" disabled>Select column</option>
                            {this.state.possibleFieldsToUnwind.map((e) => 
                                <option key={e}>{e}</option>
                            )}
                        </select>
                        <CSVLink
                            data={state.sortedData.map(e=> {
                                for (let header of this.state.tableHeadersDisplayed) {
                                    if (typeof e[header.key] == 'undefined') {
                                        e[header.key] = "";
                                    }
                                }
                                return e;
                            })}
                            headers={this.state.tableHeadersDisplayed}>
                        Download CSV
                        </CSVLink>
                        {makeTable()}
                    </div>
                )
            }}
            </ReactTable>
        );

    }
}

export default ResponseTable;

function DetailView({original, row}) {
    let old = (
        <ReactJson src={original}
        displayObjectSize={false}
        displayDataTypes={false}
        onEdit={false}
        onAdd={false}
        onDelete={false}
        collapsed={1}
        style={{"fontFamily": "Arial, sans-serif", "marginLeft": "30px"}}
        />
    );
    return old;
    //return <ReactTable data={original} />
} 