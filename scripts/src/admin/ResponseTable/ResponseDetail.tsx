import ReactJson from 'react-json-view';
import * as React from 'react';
import { API } from "aws-amplify";
import dataLoadingView from "../util/DataLoadingView";

class ResponseDetail extends React.Component<{data: any, responseId: any}, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            data: this.props.data.res
        };
    }
    render() {
        return (
            <div className="container-fluid" key={this.props.responseId}>
                <div className="row">
                <div className="card col-12 col-sm-4">
                    <div className="card-body">
                        <h5 className="card-title">Details</h5>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id={`defaultCheck_${this.props.responseId}`} />
                                <label className="form-check-label" htmlFor={`defaultCheck_${this.props.responseId}`} >
                                    Picked up bib (Not implemented yet!)
                                </label>
                            </div>
                    </div>
                </div>
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