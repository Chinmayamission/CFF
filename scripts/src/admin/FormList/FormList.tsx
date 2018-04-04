/// <reference path="./FormList.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import { API } from 'aws-amplify';
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import "./FormList.scss";

class FormList extends React.Component<IFormListProps, IFormListState> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            formList: null
        }
    }
    loadFormList() {
        return API.get("CFF", "centers/" + this.props.match.params.centerId + "/forms", {}).then(e => {
            this.setState({ "formList": e.res });
        }).catch(e => this.props.onError(e));
    }
    componentDidMount() {
        this.loadFormList();
    }
    showEmbedCode(formId) {

    }
    render() {
        return (
            <table className="ccmt-cff-form-list table table-sm table-responsive-sm">
                <thead>
                    <tr>
                        <th>Form name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.formList && this.state.formList.map((form) =>
                        <tr key={form["id"]}>
                            <td>{form["name"]}<br /><small><code>{form["id"]}</code></small> </td>
                            <td>
                                <div className="btn-group btn-group-sm">
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="FormEmbed"
                                        url={`${this.props.match.url}/${form.id}/embed`}
                                        icon="oi-document"
                                        text="Embed"
                                        userId={this.props.userId}
                                        disabled={true}
                                        />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="FormEdit"
                                        url={`${this.props.match.url}/${form.id}/edit`}
                                        icon="oi-pencil"
                                        text="Edit"
                                        userId={this.props.userId}
                                        disabled={true} />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="ViewResponses"
                                        url={`${this.props.match.url}/${form.id}/responses`}
                                        icon="oi-sort-ascending"
                                        text="Responses"
                                        userId={this.props.userId} />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="ViewResponseSummary"
                                        url={`${this.props.match.url}/${form.id}/summary`}
                                        icon="oi-list"
                                        text="Summary"
                                        userId={this.props.userId} />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="FormShare"
                                        url={`${this.props.match.url}/${form.id}/share`}
                                        icon="oi-share-boxed"
                                        text="Share"
                                        userId={this.props.userId}
                                        disabled={true}
                                    />
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )
    }
}
function ActionButton(props) {
    return (<NavLink to={`${props.url}`}>
        <button className="ccmt-cff-btn-action" disabled={props.disabled || !hasPermission(props.permissions, props.permissionName, props.userId)}>
            <span className={`oi ${props.icon}`}></span> {props.text}
        </button>
    </NavLink>);
}
function hasPermission(permissions, permissionName, userId) {
    console.log(arguments);
    if (permissions) {
        if (permissions[permissionName] && ~permissions[permissionName].indexOf(userId)) {
            return true;
        }
        else if (permissions["owner"] && ~permissions["owner"].indexOf(userId)) {
            return true;
        }
    }
    return false;
}
export default FormList;