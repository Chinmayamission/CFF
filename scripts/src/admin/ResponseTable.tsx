import * as React from 'react';
import axios from 'axios';

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;


class ResponseTable extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            status: STATUS_RESPONSES_LOADING,
            tableData: {}
        }
    }

    createTable(tableData) {
        return (
            <table>
            {Object.keys(tableData).map( (key) => 
            <tr key = {key}>
                <td>{key}</td>
                {tableData[key].map(
                    (value) => 
                        <td key = {value}>{value}</td>
                )}
            </tr>)}
            </table>
        );
    }

    getFormUrl(action) {
        let formId = this.props.formId['$oid'];
        return this.props.apiEndpoint + '?action=' + action + '&apiKey=' + this.props.apiKey +  '&id=' + formId;
    }

    jsonify(data) {
        let ret = {};
        const size = data.length;
        for(let obj of data) {
            let value = obj["value"];
            if(value) {
                for(let key in value) {
                    ret[key] = [];
                }
            }
        }
        for(let i = 0; i < size; i++) {
            let obj = data[i];
            let value = obj["value"];
            if(value) {
                for(let key in ret) {
                    if(value[key]) {
                        ret[key].push(value[key]);
                    }
                    else {
                        ret[key].push(null);
                    }
                }
            }
        }
        return ret;
    }


    componentDidMount() {
        const responseUrl = this.getFormUrl('formResponses');
        console.log(responseUrl);
        axios.get(responseUrl, {"responseType": "json"})
        .then(response => {
            console.log(response);
            return response.data.res[0].responses
        })
        .then(data => {
            //console.log(data)
            let final = this.jsonify(data);
            //console.log("final\n", final);
            this.setState({tableData: final,
                        status: STATUS_RESPONSES_RENDERED});
        });
    }

    render() {
        if (this.state.status == STATUS_RESPONSES_LOADING) {
            return ( 
              <div className='my-nice-tab-container'>
                <div className='loading-state'>Loading...</div>
              </div>
              );
          } else if (this.state.status == STATUS_RESPONSES_RENDERED) {
            return (
                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td>"hi"</td>
                            </tr>
                        </tbody>
                    </table>
                    {this.createTable(this.state.tableData)}
                </div>
            );
          }
    }
}

export default ResponseTable;