import * as React from 'react';
import axios from 'axios';

const STATUS_RESPONSES_LOADING = 0;
const STATUS_RESPONSES_RENDERED = 2;

function ObjectRow(props) {
    console.log("hi2");
    console.log(props.row);
    let row = props.row;
    let ret = (
        <tr style = {{outline: 'thin solid'}}>
            {row.map((info) => {
                console.log(info);
                return (<td key = {info}>{info}</td>)
            })}
        </tr>
    )
    console.log("ret\n", ret);
    return ret;
}


class ResponseTable extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            status: STATUS_RESPONSES_LOADING,
            tableData: {}
        }
    }

    createTable(tableData) {
        console.log("hi");
        let len = this.findLen(tableData);
        let rows = [];
        let currRow = [];
        for(let key in tableData) {
            currRow.push(key);
        }
        console.log("currRpw", currRow);
        rows.push(<ObjectRow key = {len} row = {currRow}/>);
        for(let i = 0; i < len; i++) {
            currRow = []
            for(let key in tableData) {
                currRow.push(tableData[key][i]);   
            }
            console.log("currRpw", currRow);
            rows.push(<ObjectRow key = {i} row = {currRow}/>);
        }


        return <table><tbody>{rows}</tbody></table>;
    }

    findLen(tableData) {
        let len = 0;
        for(let key in tableData) {
            if(tableData[key]) {
                return tableData[key].length;
            }
        }
        return 0;
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
                    {this.createTable(this.state.tableData)}
                </div>
            );
          }
    }
}

export default ResponseTable;