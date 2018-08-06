import React from "react";
import ReactJson from "react-json-view";
import { connect } from "react-redux";
import { editResponse } from "src/store/responses/actions";


const ValueEdit = (props: {data: any}) =>
    <ReactJson src={props.data}
        displayObjectSize={false}
        displayDataTypes={false}
        onEdit={e => e}
        onAdd={false}
        onDelete={false}
        collapsed={1}
        style={{ "fontFamily": "Arial, sans-serif", "marginLeft": "30px" }}
    />;

const mapStateToProps = state => ({
    ...state.auth
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    editResponse: (a, b, c) => dispatch(editResponse(a, b, c))
});

export default connect(mapStateToProps, mapDispatchToProps)(ValueEdit);