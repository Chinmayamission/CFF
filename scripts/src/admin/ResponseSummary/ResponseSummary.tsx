import * as React from 'react';
import axios from 'axios';
import 'react-table/react-table.css';
import ReactTable from 'react-table';
import ReactJson from 'react-json-view';
import {flatten} from 'flat';
import {assign, concat, groupBy, get, map, keys, isArray, intersectionWith, find, union, filter} from 'lodash-es';
import {CSVLink} from 'react-csv';
import Loading from "src/common/Loading/Loading";
import FormLoader from "src/common/FormLoader";
import MockData from "src/common/util/MockData";
import Headers from "src/admin/util/Headers";
import {API} from "aws-amplify";

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;

class ResponseSummary extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            tables: null
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

    componentWillMount() {
        
        API.get("CFF", "forms/" + this.props.match.params.formId + "/summary", {})
            .then(data => {
                let tables = [];
                for (let tableName in data.res.mainTable) {
                    let tbl = data.res.mainTable;
                    let tableData = Object.keys(tbl[tableName]).map(e => ({"Value": e, "Count": tbl[tableName][e]}));
                    tables.push({
                        title: `Aggregated by ${tableName}`,
                        headers: Headers.makeHeaderObjsFromKeys(["Value", "Count"]),
                        data: tableData
                    });
                }
                for (let unwindName in data.res.unwindTables) {
                    for (let tableName in data.res.unwindTables[unwindName]) {
                        let tbl = data.res.unwindTables[unwindName];
                        let tableData = Object.keys(tbl[tableName]).map(e => ({"Value": e, "Count": tbl[tableName][e]}));
                        tables.push({
                            title: `${unwindName} aggregated by ${tableName}`,
                            headers: Headers.makeHeaderObjsFromKeys(["Value", "Count"]),
                            data: tableData
                        });
                    }
                }
                
                this.setState({tables: tables});
            /*
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
            });*/
        });
    }

    render() {
        return (<div>
            {this.state.tables && this.state.tables.map(tbl =>
                <div>
                    <h4 className="mt-2">{tbl.title}</h4>
                    <ReactTable
                    data={tbl.data}
                    columns={tbl.headers}
                    minRows={0}
                    showPagination={false} />
                </div>
            )}
        </div>);
        /*if (this.state.status == STATUS_RESPONSES_LOADING) {
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
                />
            );
        }*/

    }
}

export default ResponseSummary;