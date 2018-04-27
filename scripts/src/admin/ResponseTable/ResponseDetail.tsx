import ReactJson from 'react-json-view';
import * as React from 'react';
import { API } from "aws-amplify";
import ReactTable from "react-table";
import dataLoadingView from "../util/DataLoadingView";
import {get, set} from "lodash-es";

class ResponseDetail extends React.Component<{data: any, formId: string, responseId: string, dataOptions: IDataOptions}, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            data: this.props.data.res
        };
    }
    changeCheckIn(row, checked) {
        console.log(checked);
        API.post("CFF", `forms/${this.props.formId}/responses/${this.props.responseId}/edit`, {
            "body":
            {
                "path": `value.${row.cff_accessor}.check_in`, // participants[0].check_in
                "value": checked
            }
        }).then(e => {
            console.log("Response update succeeded", e);
            this.setState({"data": e.res});
        }).catch(e => {
            alert(`Response update failed: ${e}`);
        })
    }
    getColorFromRace(race) {
        switch (race) {
            case "Mela": return "#a4c2f4";
            case "Half Marathon": return "#ff0000";
            case "5K": return "#00ff00";
            case "10K":
            default: return "#ffffff";
        }
    }
    render() {
        let columns = [{
            Header: "First Name",
            accessor: "name.first"
        },
        {
            Header: "Last Name",
            accessor: "name.last"
        },
        {
            Header: "T-shirt size",
            accessor: "shirt_size"
        },
        {
            Header: "Race",
            accessor: "race"
        },
        {
            Header: "Bib Number",
            accessor: "bib_number"
        },
        {
            Header: "Check in",
            accessor: "check_in",
            Cell: ({original}) => <input type="checkbox" checked={original.check_in} onChange={e => this.changeCheckIn(original, e.target.checked)} value="" id={`defaultCheck_${this.props.responseId}`} />
        },
        // {
        //     Header: "Accessor",
        //     accessor: "cff_accessor"
        // }
    ];
    let i = 0;
    let tableData = this.state.data.value.participants.map(e => Object.assign({"cff_accessor": `participants.${i++}`}, e));
    let showOmrunTable = get(this.props.dataOptions, "mainTable.omrunCheckin") == true;
        return (
            <div className="container-fluid" key={this.props.responseId}>
                <div className="row">
                {showOmrunTable && <div className="card col-12 col-sm-4">
                    <div className="card-body">
                        <h5 className="card-title">Details</h5>
                            <ReactTable
                                data={tableData}
                                columns={columns}
                                minRows={0}
                                showPagination={false}
                                getTrProps={(state, rowInfo, column) => {
                                    return {
                                      style: {
                                        backgroundColor: this.getColorFromRace(get(rowInfo.row, "race"))
                                      }
                                    }
                                  }}
                            />
                            {/* <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id={`defaultCheck_${this.props.responseId}`} />
                                <label className="form-check-label" htmlFor={`defaultCheck_${this.props.responseId}`} >
                                    Picked up bib? 
                                </label>
                            </div> */}
                    </div>
                </div>}
                <div className="card col-12 col-sm-4">
                    <div className="card-body">
                        <h5 className="card-title">Inspector</h5>
                        <ReactJson src={this.state.data}
                            displayObjectSize={false}
                            displayDataTypes={false}
                            onEdit={false}
                            onAdd={false}
                            onDelete={false}
                            collapsed={0}
                            style={{ "fontFamily": "Arial, sans-serif", "marginLeft": "30px" }}
                        />
                    </div>
                </div>
                </div>
            </div>
        );
    }
}

// export default ResponseDetail;

export default dataLoadingView(ResponseDetail, (props) => {
    return API.get("CFF", `forms/${props.formId}/responses/${props.responseId}/view`, {});
});