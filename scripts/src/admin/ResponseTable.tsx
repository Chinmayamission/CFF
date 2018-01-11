import * as React from 'react';
import axios from 'axios';
import 'react-table/react-table.css';
import ReactTable from 'react-table';
import treeTableHOC from 'react-table/lib/hoc/treeTable'
import {flatten} from 'flat';
import {filter} from 'lodash-es';
import Loading from "src/common/loading";
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;
const TreeTable = treeTableHOC(ReactTable);

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
        return this.props.apiEndpoint + '?action=' + action + '&apiKey=' + this.props.apiKey +  '&id=' + formId;
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
        .then(response => response.data.res[0].responses)
        .then(data => {
            data = data.map((e) => {
                e.value.id = e.id;
                this.setState({tableDataOrigObject: data});
                return flatten(e.value);
            });//.filter((e) => e);
            console.log(data);
            let headers = ["id"];
            let headerObjs : any = [{"Header": "id", "accessor": "id"}];
            this.makeHeaders(data, headers, headerObjs);

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

    makeHeaders(data, headers=[], headerObjs=[]) {
        for (let response of data) {
            for (let header in response) {
                if (!~headers.indexOf(header)) {
                    headers.push(header);
                    headerObjs.push({
                        Header: header,
                        id: header,
                        accessor: d=> typeof d[header] === 'string' ? d[header] : JSON.stringify(d[header])//d=> JSON.stringify(d[header]) // String-based value accessors!
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
        let headerObjs = [];
        let origData = this.state.tableDataOrigObject.map(e => e.value);
        let data = [];
        for (let item of origData) {
            if (!item[rowToUnwind]) continue;
            for (let unwoundItem of item[rowToUnwind]) {
                data.push(flatten(unwoundItem));
            }
        }
        this.makeHeaders(data, [], headerObjs);
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
                    <button className="button" onClick={() => this.showResponsesTable()}>View all responses</button>
                    &emsp;Or unwind by:
                        <select value={this.state.rowToUnwind}
                            onChange={(e) => this.showUnwindTable(e.target.value)}>
                            <option key="null" value="" disabled>Select column</option>
                            {this.state.possibleFieldsToUnwind.map((e) => 
                                <option key={e}>{e}</option>
                            )}
                        </select>
                    {/*<button className="button" onClick={() => this.showUnwindTable()}>
                    Unwind data
                        </button>*/}
                    <ReactTable
                    data={this.state.tableDataDisplayed}
                    columns={this.state.tableHeadersDisplayed}
                    minRows={0}
                    //pivotBy={this.state.pivotCols}
                    /*SubComponent={({original, row}) => {
                        return (
                          <div>
                            You can put any component you want here, even another React Table! You even have access to the row-level data if you need!  Spark-charts, drill-throughs, infographics... the possibilities are endless!
                          </div>
                        )} }*/
                    />
                </div>
            );
        }

    }
}

export default ResponseTable;