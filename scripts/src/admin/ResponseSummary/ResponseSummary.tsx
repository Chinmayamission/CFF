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
import dataLoadingView from "../util/DataLoadingView";

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;

class ResponseSummary extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            tables: null,
            hasError: false,
            loading: true
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

    componentDidMount() {
        
        let data = this.props.data;
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
        
        this.setState({tables});
    }

    render() {
        return (<div className="row">
            {this.state.tables && this.state.tables.map(tbl =>
                <div className="col-12 col-sm-6 col-md-4">
                    <h4 className="mt-2">{tbl.title}</h4>
                    <ReactTable
                    key={tbl.title}
                    data={tbl.data}
                    columns={tbl.headers}
                    minRows={0}
                    showPagination={false} />
                </div>
            )}
        </div>);
    }
}

export default dataLoadingView(ResponseSummary, (props) => {
    return API.get("CFF", "forms/" + props.match.params.formId + "/summary", {});
});