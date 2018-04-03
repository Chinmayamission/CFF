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
            <table className="ccmt-cff-form-list table table-hover table-sm table-responsive-sm">
                <thead>
                    <tr>
                        <th>Form name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.formList && this.state.formList.map((form) =>
                        <tr key={form["id"]}>
                            <td>{form["name"]}</td>
                            <td>
                                <div className="btn-group btn-group-sm">
                                    <a>
                                        <button className="ccmt-cff-btn-action" disabled>
                                            <span className="oi oi-pencil"></span> Edit
                                        </button>
                                    </a>
                                    {/*<button className="btn btn-primary" onClick = {() => this.props.embedForm(form)}>Embed</button>
                                    <button className="btn" onClick = {() => this.props.editForm(form)}>Edit</button>*/}
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
                                    {/*<button className="btn" onClick = {() => this.props.loadResponseSummary(form)}>Response Summary</button>*/}
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
        <button className="ccmt-cff-btn-action" disabled={!hasPermission(props.permissions, props.permissionName, props.userId)}>
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