/// <reference path="./FormShare.d.ts"/>
import * as React from 'react';
import { API } from "aws-amplify";
import dataLoadingView from "../util/DataLoadingView";
import { forOwn, set, get } from "lodash-es";
import UserRow from "./UserRow";

class FormShare extends React.Component<IFormShareProps, IFormShareState> {
    constructor(props: any) {
        super(props);
        let data = props.data;
        this.state = {
            possiblePermissions: data['res']['possiblePermissions'],
            permissions: data['res']['permissions'],
            users: data['res']['userLookup'],
            newUserId: ""
        };
    }

    onPermissionsChange(userId, permissionName, value) {
        let permissions = this.state.permissions;
        set(permissions, `${userId}.${permissionName}`, value);
        return API.post("CFF", `forms/${this.props.match.params.formId}/permissions`, {
            "body": {
                "userId": userId,
                "permissions": get(permissions, userId)
            }
        }).then(e => {
            this.setState({ permissions });
        }).catch(e => {
            alert("You do not have permission to do this action.");
            this.props.onError(e);
        })
    }

    addUser() {
        this.onPermissionsChange(this.state.newUserId, "Responses_View", false).then(e => {
            this.setState({ newUserId: "" });
            this.props.refreshData();
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
                                user={this.state.users[userId] || {}}
                                permissions={this.state.permissions[userId] || {}}
                                onPermissionsChange={(a, b, c) => this.onPermissionsChange(a, b, c)} />
                        )}
                        <form style={{ "display": "table-row" }}
                            onSubmit={e => { e.preventDefault(); this.addUser() }}>
                            <td colSpan={3}>
                                <input placeholder="Enter new user ID" type="text"
                                    value={this.state.newUserId}
                                    onChange={e => this.setState({ newUserId: e.target.value })}
                                    className="form-control form-control-sm"
                                />
                            </td>
                            <td>
                                <button
                                    type="submit"
                                    className="form-control form-control-sm"
                                >Submit</button>
                            </td>
                        </form>
                    </tbody>
                </table>
            </div>
        </div>);
    }
}


export default dataLoadingView(FormShare, (props) => {
    return API.get("CFF", `forms/${props.match.params.formId}/permissions`, {});
});