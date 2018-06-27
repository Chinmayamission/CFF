/// <reference path="./ResponseDetail.d.ts"/>
import ReactJson from 'react-json-view';
import * as React from 'react';
import { API } from "aws-amplify";
import ReactTable from "react-table";
import dataLoadingView from "../util/DataLoadingView";
import {get, set} from "lodash-es";

class ResponseDetail extends React.Component<IResponseDetailProps, IResponseDetailState> {
    constructor(props:any) {
        super(props);
        this.state = {
            data: this.props.data.res
        };
    }
    changeCheckIn(row, checked) {
        console.log(checked);
        API.post("CFF_v2", `forms/${this.props.formId}/responses/${this.props.responseId}/checkin`, {
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
            case "Half Marathon": return "#ff4e50";
            case "5K": return "#00ff00";
            case "10K": return "#fcfbe3"
            default: return "#ffffff";
        }
    }
    render() {
        let cell = row => row.value || "None";
        let columns = [{
            Header: "First Name",
            accessor: "name.first",
            Cell: cell
        },
        {
            Header: "Last Name",
            accessor: "name.last",
            Cell: cell
        },
        {
            Header: "T-shirt size",
            accessor: "shirt_size",
            Cell: cell
        },
        {
            Header: "Race",
            accessor: "race",
            Cell: cell
        },
        {
            Header: "Bib Number",
            accessor: "bib_number",
            Cell: cell
        },
        {
            Header: "Check in",
            accessor: "check_in",
            Cell: ({original}) => <input type="checkbox" checked={original.check_in} onChange={e => this.changeCheckIn(original, e.target.checked)} value="" id={`defaultCheck_${this.props.responseId}`} />
        }
    ];
    let i = 0;
    let showOmrunTable = get(this.props.dataOptions, "checkinTable.omrunCheckin") == true;
        return (
            <div className="container-fluid" key={this.props.responseId}>
                <div className="row">
                {this.props.checkInMode && showOmrunTable && this.state.data.value.participants && <div className="card col-12">
                    <div className="card-body">
                        <h5 className="card-title">Details</h5>
                            <ReactTable
                                data={this.state.data.value.participants.map(e => Object.assign({"cff_accessor": `participants.${i++}`}, e))}
                                columns={columns}
                                minRows={0}
                                showPagination={true}
                                getTrProps={(state, rowInfo, column) => {
                                    return {
                                      style: {
                                        backgroundColor: this.getColorFromRace(get(rowInfo.row, "race"))
                                      }
                                    }
                                  }}
                            />
                    </div>
                </div>}
                {!this.props.checkInMode && <div className="card col-12">
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
                </div>}
                </div>
            </div>
        );
    }
}

// export default ResponseDetail;

export default dataLoadingView(ResponseDetail, (props) => {
    return API.get("CFF_v2", `forms/${props.formId}/responses/${props.responseId}/view`, {});
});