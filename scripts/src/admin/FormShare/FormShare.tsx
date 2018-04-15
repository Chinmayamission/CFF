import * as React from 'react';
import {API} from "aws-amplify";
import dataLoadingView from "../util/DataLoadingView";

class FormShare extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            permissions: null,
            users: null
        }
    }

    componentDidMount() {
        let data = this.props.data;
        this.setState({permissions: data['res']['permissions'], users: data['res']['userLookup']});
    }

    render() {
        return (<div className="row">
            {this.state.permissions && Object.keys(this.state.permissions).map(userId =>
                <div className="col-12 col-sm-6 col-md-4">
                    <h4 className="mt-2">{this.state.users[userId].name}</h4>
                    {this.state.permissions[userId].map(permissionName => <div>{permissionName}</div>)}
                </div>
            )}
        </div>);
    }
}

export default dataLoadingView(FormShare, (props) => {
    return API.get("CFF", `forms/${props.match.params.formId}/permissions`, {});
});