/// <reference path="./FormList.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import { API } from 'aws-amplify';
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import {isArray} from "lodash-es";
import "./FormList.scss";
import FormNew from "../FormNew/FormNew";

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
                        <th>
                            <FormNew centerId={this.props.match.params.centerId} onError={this.props.onError} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.formList && this.state.formList.map((form) =>
                        <tr key={form["id"]}>
                            <td>{form["name"]}<br />
                                <small title={`s: ${form["schema"]["id"]} v${form["schema"]["version"]};\n sM: ${form["schemaModifier"]["id"]} v${form["schemaModifier"]["version"]}`}><code>{form["id"]}</code></small>
                            </td>
                            <td>
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="Forms_Embed"
                                        url={`${this.props.match.url}/${form.id}/embed`}
                                        icon="oi-document"
                                        text="Embed"
                                        userId={this.props.userId}
                                        disabled={true}
                                        />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="Forms_Edit"
                                        url={`${this.props.match.url}/${form.id}/edit`}
                                        icon="oi-pencil"
                                        text="Edit"
                                        userId={this.props.userId} />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="Responses_View"
                                        url={`${this.props.match.url}/${form.id}/responses`}
                                        icon="oi-sort-ascending"
                                        text="Responses"
                                        userId={this.props.userId} />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="Responses_ViewSummary"
                                        url={`${this.props.match.url}/${form.id}/summary`}
                                        icon="oi-list"
                                        text="Summary"
                                        userId={this.props.userId} />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="Forms_PermissionsView"
                                        url={`${this.props.match.url}/${form.id}/share`}
                                        icon="oi-share-boxed"
                                        text="Share"
                                        userId={this.props.userId}
                                    />
                                    <ActionButton permissions={form.cff_permissions}
                                        permissionName="Responses_Edit"
                                        url={`${this.props.match.url}/${form.id}/responsesEdit`}
                                        icon="oi-pencil"
                                        text="Edit Responses"
                                        userId={this.props.userId}
                                    />
                                    {/*<ActionButton permissions={form.cff_permissions}
                                        permissionName="Responses_View"
                                        url={`${this.props.match.url}/${form.id}/lookup`}
                                        icon="oi-magnifying-glass"
                                        text="Check in"
                                        userId={this.props.userId}
                                        disabled={false}
                                    />*/}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )
    }
}
function ActionButton(props) {
    let disabled = props.disabled || !hasPermission(props.permissions, props.permissionName, props.userId);
    if (disabled) {
        return (<a href="">
            <button className="ccmt-cff-btn-action" disabled={true}>
                <span className={`oi ${props.icon}`}></span> {props.text}
            </button>
        </a>);
    }
    else {
        return (<NavLink to={`${props.url}`}>
            <button className="ccmt-cff-btn-action">
                <span className={`oi ${props.icon}`}></span> {props.text}
            </button>
        </NavLink>);
    }
}
function hasPermission(cff_permissions, permissionNames, userId) {
    if (!isArray(permissionNames)) {
        permissionNames = [permissionNames];
    }
    permissionNames.push("owner");
    if (cff_permissions && cff_permissions[userId]) {
        for (let permissionName of permissionNames) {
            if (cff_permissions[userId][permissionName] == true) {
                return true;
            }
        }
        return false;
    }
    return false;
}
export default FormList;