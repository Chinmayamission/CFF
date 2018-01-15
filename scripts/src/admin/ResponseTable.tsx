import * as React from 'react';
import axios from 'axios';
import 'react-table/react-table.css';
import ReactTable from 'react-table';
//import treeTableHOC from 'react-table/lib/hoc/treeTable'
import {flatten} from 'flat';
import {assign, concat} from 'lodash-es';
import {CSVLink} from 'react-csv';
import Loading from "src/common/loading";
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";
import ReactJson from 'react-json-view';

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;
//const TreeTable = treeTableHOC(ReactTable);

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

            data = data.map((e) => {
                assign(e.value, {
                    "ID": e.responseId,
                    "PAID": e.PAID,
                    "IPN_TOTAL_AMOUNT": e.IPN_TOTAL_AMOUNT,
                    "IPN_HISTORY": e.IPN_HISTORY,
                    "DATE_CREATED": e.date_created,
                    "DATE_LAST_MODIFIED": e.date_last_modified,
                    "PAYMENT_INFO": e.paymentInfo,
                    "CONFIRMATION_EMAIL_INFO": e.confirmationEmailInfo
                });
                this.setState({tableDataOrigObject: data});
                if (e.paid) {console.log("PAID!", e.paid)}
                return e.value;
                //return flatten(e.value);
            });
            
            console.log(data);
            let paidHeader = makeHeaderObjsFromKeys(["PAID"]);
            assign(paidHeader[0],
                {
                    "filterMethod": (filter, row) => {
                        if (filter.value === "all") {
                        return true;
                        }
                        if (filter.value === "paid") {
                        return row[filter.id] == true;
                        }
                        return !row[filter.id]; // || row[filter.id] == false;
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
                }
            );
            let headerObjs : any = concat(
                paidHeader,
                makeHeaderObjsFromKeys(["ID"]),
                this.makeHeaders(this.state.schema.properties),
                makeHeaderObjsFromKeys(["DATE_CREATED", "DATE_LAST_MODIFIED"])
            );
            
            // Set possible rows to unwind, equal to top-level array items.
            let possibleFieldsToUnwind = [];
            for (let fieldName in this.state.schema.properties) {
                let fieldValue = this.state.schema.properties[fieldName];
                if (fieldValue.type == "array") {
                    possibleFieldsToUnwind.push(fieldName);
                }
            }
            console.log("possibleFieldsToUnwind", possibleFieldsToUnwind);
            
            this.setState({
                tableHeaders: headerObjs, tableHeadersDisplayed: headerObjs,
                tableData: data, tableDataDisplayed: data,
                status: STATUS_RESPONSES_RENDERED,
                possibleFieldsToUnwind
            });
        });
    }

    makeHeaders(schemaProperties, headerObjs=[]) {
        this.makeHeadersHelper(schemaProperties, headerObjs);
        return headerObjs;
    }
    makeHeadersHelper(schemaProperties, headerObjs, prefix="") {
        for (let header in schemaProperties) {
            if (schemaProperties[header]["type"] == "object") {
                this.makeHeadersHelper(schemaProperties[header]["properties"], headerObjs, header);
                continue;
            }
            else if (schemaProperties[header]["type"] == "array") {
                continue;
            }
            // header = header.replace("properties.", "").replace(".items.", ".0.");
            header = prefix ? prefix + "." + header : header;
            headerObjs.push(makeHeaderObj(header));
        }
    }

    makeHeadersOld(data, headers=[], headerObjs=[]) {
        /* Makes headers based on looping through all the data and making sure it got something. (very inefficient, not used anymore)
        */
        for (let response of data) {
            for (let header in response) {
                if (!~headers.indexOf(header)) {
                    headers.push(header);
                    headerObjs.push({
                        Header: header,
                        id: header,
                        accessor: d=> typeof d[header] === 'string' ? d[header] : "", //JSON.stringify(d[header]),
                        // For react csv export:
                        label: header,
                        key: header
                        //d=> JSON.stringify(d[header]) // String-based value accessors!
                      });
                }
            }
        }
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
            for (let unwoundItem of item[rowToUnwind]) {
                data.push(unwoundItem);
            }
        }
        let headerObjs = this.makeHeaders(this.state.schema.properties[rowToUnwind].items.properties);
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
                            data={this.state.tableDataDisplayed.filter(e=>e).map(e=>(e))}
                            headers={this.state.tableHeadersDisplayed}>
                        Download CSV
                        </CSVLink>
                    {/*<button className="btn" onClick={() => this.showUnwindTable()}>
                    Unwind data
                        </button>*/}
                    <ReactTable
                    data={this.state.tableDataDisplayed}
                    columns={this.state.tableHeadersDisplayed}
                    minRows={0}
                    filterable
                    //pivotBy={this.state.pivotCols}
                    defaultFiltered= { this.state.rowToUnwind ? [] : [{"id": "PAID", "value": "paid"}] }
                    SubComponent={ this.state.rowToUnwind ? null : DetailView }
                    />
                </div>
            );
        }

    }
}

export default ResponseTable;

function makeHeaderObjsFromKeys(keys) {
    // Add a specified list of headers.
    let headerObjs = [];
    for (let header of keys) {
        headerObjs.push(makeHeaderObj(header));
    }
    return headerObjs;
}

function makeHeaderObj(header) {
    // Makes a single header object.
    return {
        // For react table js:
        Header: header.replace(/^([a-z])/, t => t.toUpperCase()),
        id: header,
        accessor: header,
        // For csv export:
        label: header.replace(/^([a-z])/, t => t.toUpperCase()),
        key: header
    };
}

function DetailView({original, row}) {
    return (
        <ReactJson src={original}
        displayObjectSize={false}
        displayDataTypes={false}
        onEdit={false}
        onAdd={false}
        onDelete={false}
        collapsed={1}
        style={{"fontFamily": "Arial, sans-serif", "marginLeft": "30px"}}
        />
    )
} 