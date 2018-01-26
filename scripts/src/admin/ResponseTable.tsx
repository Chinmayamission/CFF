import * as React from 'react';
import axios from 'axios';
import 'react-table/react-table.css';
import ReactTable from 'react-table';
import ReactJson from 'react-json-view';
import {flatten} from 'flat';
import {assign, concat} from 'lodash-es';
import {CSVLink} from 'react-csv';
import Loading from "src/common/Loading/Loading";
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";
import Headers from "src/admin/util/Headers";

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;

class ResponseTable extends React.Component<any, IResponseTableState> {
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
            rowToUnwind: ""
        }
    }

    getFormUrl(action) {
        let formId = this.props.form.id;
        return this.props.apiEndpoint + '?action=' + action + '&apiKey=' + this.props.apiKey +  '&version=1&id=' + formId;
    }

    componentDidMount() {
        
        FormLoader.getFormAndCreateSchemas(this.props.apiEndpoint, this.props.form.id, (e) => this.props.handleError(e)).then(({ schema }) => {
            this.setState({
                schema
            });
        }).then(() => {
            let responseUrl = this.getFormUrl('formResponses');
            return axios.get(responseUrl, {"responseType": "json"}).catch(e => {
                if ((window as any).CCMT_CFF_DEVMODE===true) {
                    return MockData.formResponses;
                }
                alert("Error loading the form responses. " + e);
            });
        })
        .then(response => response.data.res)
        .then(data => data.filter(e => typeof e === "object" && e.value))
        .then(data => {
            data = data.sort((a,b) => a.value.date_created - b.value.date_created);
            data = data.map((e, index) => {
                assign(e.value, {
                    "ID": e.responseId,
                    "PAID": e.PAID ? "YES": "NO",
                    "IPN_TOTAL_AMOUNT": e.IPN_TOTAL_AMOUNT,
                    "IPN_HISTORY": e.IPN_HISTORY,
                    "DATE_CREATED": e.date_created,
                    "NUMERIC_ID": index + 1,
                    "DATE_LAST_MODIFIED": e.date_last_modified,
                    "PAYMENT_INFO": e.paymentInfo,
                    "CONFIRMATION_EMAIL_INFO": e.confirmationEmailInfo
                });
                this.setState({tableDataOrigObject: data});
                return e.value;
                //return flatten(e.value);
            });
            
            console.log(data);
            let paidHeader = Headers.makeHeaderObjsFromKeys(["PAID"]);
            let headerObjs : any = concat(
                paidHeader,
                Headers.makeHeaderObjsFromKeys(["ID"]),
                Headers.makeHeaders(this.state.schema.properties),
                Headers.makeHeaderObjsFromKeys(["DATE_CREATED", "DATE_LAST_MODIFIED"])
            );
            
            // Set possible rows to unwind, equal to top-level array items.
            let possibleFieldsToUnwind = [];
            for (let fieldName in this.state.schema.properties) {
                let fieldValue = this.state.schema.properties[fieldName];
                if (fieldValue.type == "array") {
                    possibleFieldsToUnwind.push(fieldName);
                }
            }
            
            this.setState({
                tableHeaders: headerObjs, tableHeadersDisplayed: headerObjs,
                tableData: data, tableDataDisplayed: data,
                status: STATUS_RESPONSES_RENDERED,
                possibleFieldsToUnwind
            });
        });
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
                unwoundItem["NUMERIC_ID"] = unwoundItem["NUMERIC_ID"] + "." + (parseInt(i) + 1);
                data.push(unwoundItem);
            }
        }
        let headerObjs = concat(
            // Headers.makeHeaderObjsFromKeys(["ID", "PAID"]),
            Headers.makeHeaderObjsFromKeys(["NUMERIC_ID"]),
            Headers.makeHeaders(this.state.schema.properties[rowToUnwind].items.properties),
            this.state.tableHeaders // concat original table headers with this.
        );
        this.setState({
            tableDataDisplayed: data,
            tableHeadersDisplayed: headerObjs
        });
    }

    showResponsesTable() {
        // Show "regular" response table, one row per response.
        this.setState({"rowToUnwind": ""});
        this.setState({
            tableHeadersDisplayed: this.state.tableHeaders,
            tableDataDisplayed: this.state.tableData
        })
    }

    render() {
        if (this.state.status == STATUS_RESPONSES_LOADING) {
            return <Loading />;
        }

        else if (this.state.status == STATUS_RESPONSES_RENDERED) {
            return (
                <ReactTable
                data={this.state.tableDataDisplayed}
                columns={this.state.tableHeadersDisplayed}
                minRows={0}
                filterable
                //pivotBy={this.state.pivotCols}
                defaultSorted = { this.state.rowToUnwind ? [] : [{"id": "DATE_LAST_MODIFIED", "desc": true}] }
                defaultFiltered= { [{"id": "PAID", "value": "paid"}] }
                SubComponent={ this.state.rowToUnwind ? null : DetailView }
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
                                data={state.sortedData.map(e=>flatten(e))}
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