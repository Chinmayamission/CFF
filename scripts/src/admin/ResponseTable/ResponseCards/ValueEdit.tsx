import React from "react";
import ReactJson from "react-json-view";
import { connect } from "react-redux";
import { editResponse } from "src/store/responses/actions";
import { ResponsesState } from "../../../store/responses/types";

interface IValueEditProps extends ResponsesState {
    editResponse: (a: string, b: string, c: any) => any
}
class ValueEdit extends React.Component<IValueEditProps, {}> {
    onEdit(e) {
        /*
        {
            "existing_src": {
              "name": "old"
            },
            "new_value": "new",
            "updated_src": {
              "name": "new"
            },
            "name": "name",
            "namespace": [],
            "existing_value": "old"
          }
        */
        let path = e.namespace.join(".");
        if (path != "") {
            path += ".";
        }
        path += e.name;
        let value = e.new_value;
        this.props.editResponse(this.props.responseData._id.$oid, path, value);
        return false;
    }
    render() {
        return <ReactJson src={this.props.responseData.value}
            displayObjectSize={false}
            displayDataTypes={false}
            onEdit={e => this.onEdit(e)}
            onAdd={false}
            onDelete={false}
            collapsed={1}
            style={{ "fontFamily": "Arial, sans-serif", "marginLeft": "30px" }}
        />;
    }
}

const mapStateToProps = state => ({
    ...state.responses
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    editResponse: (a, b, c) => dispatch(editResponse(a, b, c))
});

export default connect(mapStateToProps, mapDispatchToProps)(ValueEdit);