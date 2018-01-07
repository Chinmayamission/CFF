import * as React from 'react';
import axios from 'axios';
import 'react-table/react-table.css';
import ReactTable from 'react-table';
import {flatten} from 'flat';
import Loading from "src/common/loading";

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;

class ResponseTable extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            status: STATUS_RESPONSES_LOADING,
            tableData: [],
            tableHeaders: []
        }
    }

    getFormUrl(action) {
        let formId = this.props.formId['$oid'];
        return this.props.apiEndpoint + '?action=' + action + '&apiKey=' + this.props.apiKey +  '&id=' + formId;
    }

    componentDidMount() {
        const responseUrl = this.getFormUrl('formResponses');
        console.log(responseUrl);
        axios.get(responseUrl, {"responseType": "json"})
        .then(response => response.data.res[0].responses)
        .then(data => {
            data = data.map((e) => flatten(e.value)).filter((e) => e);
            console.log(data);
            let headers = [];
            let headerObjs = [];
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
            this.setState({tableHeaders: headerObjs, tableData: data, status: STATUS_RESPONSES_RENDERED});
        });
    }

    render() {
        if (this.state.status == STATUS_RESPONSES_LOADING) {
            return <Loading />;
        }

        else if (this.state.status == STATUS_RESPONSES_RENDERED) {
            return (
                <div>
                    <ReactTable
                    data={this.state.tableData}
                    columns={this.state.tableHeaders}
                    />
                </div>
            );
        }

    }
}

export default ResponseTable;