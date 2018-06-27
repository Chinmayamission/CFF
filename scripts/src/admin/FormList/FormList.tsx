/// <reference path="./FormList.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import { API } from 'aws-amplify';
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import {isArray} from "lodash-es";
import "./FormList.scss";
import FormNew from "../FormNew/FormNew";
import { connect } from 'react-redux';

const mapStateToProps = state => ({
    ...state.auth
});
  
const mapDispatchToProps = (dispatch, ownProps) => ({

});


class FormList extends React.Component<IFormListProps, IFormListState> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            formList: null
        }
    }
    loadFormList() {
        return API.get("CFF_v2", "forms", {}).then(e => {
            this.setState({ "formList": e.res });
        }).catch(e => this.props.onError(e));
    }
    componentDidMount() {
        this.loadFormList();
    }
    showEmbedCode(formId) {

    }
    render() {
        let formList = this.props.selectedForm ? [this.props.selectedForm] : this.state.formList;
        return (
            <table className="ccmt-cff-form-list table table-sm table-responsive-sm">
                <thead>
                    <tr>
                        <th>Form name</th>
                        <th>Actions</th>
                        <th>
                            <FormNew onError={this.props.onError} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {formList && formList.length == 0 && <tr><td>No forms found. Create one!</td></tr>}
                    {formList && formList.map((form) =>
                        <tr key={form["_id"]}>
                            <td>{form["name"]}<br />
                                <small title={form["schemaModifier"] ? `s: ${form["schema"]["id"]} v${form["schema"]["version"]};\n sM: ${form["schemaModifier"]["id"]} v${form["schemaModifier"]["version"]}` : ""}>
                                    <code>{form["_id"]}</code>
                                </small>
                            </td>
                            <td>
                                <ActionButton form={form}
                                    permissionName="Forms_Embed"
                                    url={`${this.props.match.url}/${form._id}/embed`}
                                    icon="oi-document"
                                    text="Embed"
                                    userId={this.props.userId}
                                    />
                                <ActionButton form={form}
                                    permissionName="Forms_Edit"
                                    url={`${this.props.match.url}/${form._id}/edit`}
                                    icon="oi-pencil"
                                    text="Edit"
                                    userId={this.props.userId} />
                                <ActionButton form={form}
                                    permissionName="Responses_View"
                                    url={`${this.props.match.url}/${form._id}/responses`}
                                    icon="oi-sort-ascending"
                                    text="Responses"
                                    userId={this.props.userId} />
                                <ActionButton form={form}
                                    permissionName="Responses_CheckIn"
                                    url={`${this.props.match.url}/${form._id}/checkin`}
                                    icon="oi-check"
                                    text="Check in"
                                    userId={this.props.userId} />
                                <ActionButton form={form}
                                    permissionName="Responses_ViewSummary"
                                    url={`${this.props.match.url}/${form._id}/summary`}
                                    icon="oi-list"
                                    text="Summary"
                                    userId={this.props.userId} />
                                <ActionButton form={form}
                                    permissionName="Forms_PermissionsView"
                                    url={`${this.props.match.url}/${form._id}/share`}
                                    icon="oi-share-boxed"
                                    text="Share"
                                    userId={this.props.userId}
                                />
                                <ActionButton form={form}
                                    permissionName="Responses_Edit"
                                    url={`${this.props.match.url}/${form._id}/responsesEdit`}
                                    icon="oi-pencil"
                                    text="Edit Responses"
                                    userId={this.props.userId}
                                />
                                {/*<ActionButton permissions={form.cff_permissions}
                                    permissionName="Responses_View"
                                    url={`${this.props.match.url}/${form._id}/lookup`}
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
    let disabled = props.disabled || !hasPermission(props.form.cff_permissions, props.permissionName, props.userId);
    if (disabled) {
        return (<a href="">
            <button className="ccmt-cff-btn-action" disabled={true}>
                <span className={`oi ${props.icon}`}></span> {props.text}
            </button>
        </a>);
    }
    else {
        return (<NavLink to={{pathname: `${props.url}`, state: {selectedForm: props.form}}}>
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

export default connect(mapStateToProps, mapDispatchToProps)(FormList);