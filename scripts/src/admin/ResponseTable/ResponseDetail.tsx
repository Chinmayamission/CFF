import ReactJson from 'react-json-view';
import * as React from 'react';
import { API } from "aws-amplify";
import dataLoadingView from "../util/DataLoadingView";

class ResponseDetail extends React.Component<{data: any}, any> {
    constructor(props:any) {
        super(props);
        this.state = {
        };
    }
    render() {
        return (
            <ReactJson src={this.props.data}
                displayObjectSize={false}
                displayDataTypes={false}
                onEdit={false}
                onAdd={false}
                onDelete={false}
                collapsed={1}
                style={{ "fontFamily": "Arial, sans-serif", "marginLeft": "30px" }}
            />
        );
    }
}

// export default ResponseDetail;

export default dataLoadingView(ResponseDetail, (props) => {
    return API.get("CFF", `forms/${props.formId}/responses/${props.responseId}/view`, {});
});