/// <reference path="./FormShare.d.ts"/>
import * as React from 'react';
import {API} from "aws-amplify";
import dataLoadingView from "../util/DataLoadingView";
import {forOwn, set, get} from "lodash-es";
import UserRow from "./UserRow";

class FormShare extends React.Component<IFormShareProps, IFormShareState> {
    constructor(props:any) {
        super(props);
        let data = props.data;
        this.state = {
            possiblePermissions: data['res']['possiblePermissions'],
            permissions: data['res']['permissions'],
            users: data['res']['userLookup']
        };
    }

    onPermissionsChange(userId, permissionName, value) {
        let permissions = this.state.permissions;
        set(permissions, `${userId}.${permissionName}`, value);
        API.post("CFF", `forms/${this.props.match.params.formId}/permissions`, {
            "body": {
                "userId": userId,
                "permissions": get(permissions, userId)
            }
        }).then(e => {
            this.setState({permissions});
        });
    }

    render() {
        return (<div className="">
            <div className="">
                <table className="ccmt-cff-share-list table table-sm table-responsive-sm">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>User Email</th>
                            <th>User Id</th>
                            {this.state.possiblePermissions.map(permission =>
                                <th key={permission}>{permission}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                    {Object.keys(this.state.permissions).map(userId =>
                        <UserRow key={userId}
                            possiblePermissions={this.state.possiblePermissions}
                            user={this.state.users[userId]}
                            permissions={this.state.permissions[userId]}
                            onPermissionsChange={(a, b, c) => this.onPermissionsChange(a, b, c)}/>
                    )}
                    </tbody>
                </table>
            </div>
        </div>);
    }
}


export default dataLoadingView(FormShare, (props) => {
    return API.get("CFF", `forms/${props.match.params.formId}/permissions`, {});
});