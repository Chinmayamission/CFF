import * as React from 'react';
import axios from 'axios';
import 'react-table/react-table.css';
import ReactTable from 'react-table';
import treeTableHOC from 'react-table/lib/hoc/treeTable'
import {flatten} from 'flat';
import Loading from "src/common/loading";
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;
const TreeTable = treeTableHOC(ReactTable);

class ResponseTable extends React.Component<any, any> {
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
            schema: null
        }
    }

    getFormUrl(action) {
        let formId = this.props.form._id['$oid'];
        return this.props.apiEndpoint + '?action=' + action + '&apiKey=' + this.props.apiKey +  '&id=' + formId;
    }

    componentDidMount() {
        FormLoader.getFormAndCreateSchemas(this.props.apiEndpoint, this.props.form._id['$oid']).then(({ schema }) => {
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
                e.value.id = e._id.$oid;
                //return e.value;
                this.setState({tableDataOrigObject: data});
                return flatten(e.value);
            }).filter((e) => e);
            console.log(data);
            let headers = ["id"];
            let headerObjs : any = [{"Header": "id", "accessor": "id"}];
            this.makeHeaders(data, headers, headerObjs);
            this.setState({
                tableHeaders: headerObjs, tableHeadersDisplayed: headerObjs,
                tableData: data, tableDataDisplayed: data, status: STATUS_RESPONSES_RENDERED});
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

    showUnwindTable() {
        let rowToUnwind = 'participants';
        let headerObjs = [];
        //let keys = Object.keys(this.state.tableData).filter(k => k.match(arraySelected+".")); //todo: pickall instead.
        //console.log(keys);
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
            //pivotCols,
            tableDataDisplayed: data,
            tableHeadersDisplayed: headerObjs
        });
    }

    showResponsesTable() {
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
                    <button className="button" onClick={() => this.showResponsesTable()}>View responses</button>
                    {<button className="button" onClick={() => this.showUnwindTable()}>
                        Unwind by: 
                        <select>
                            <option>participants</option>
                        </select>
                    </button>}
                    <TreeTable
                    data={this.state.tableDataDisplayed}
                    columns={this.state.tableHeadersDisplayed}
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