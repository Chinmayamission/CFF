import * as React from 'react';
import axios from 'axios';
import { API } from 'aws-amplify';
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import { isArray } from "lodash";
import "./FormList.scss";
import FormNew from "../FormNew/FormNew";
import { connect } from 'react-redux';
import dataLoadingView from "../util/DataLoadingView";
import { IFormListProps, IFormListState } from "./FormList.d";
import { loadFormList, createForm } from '../../store/admin/actions';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import history from "../../history";

const mapStateToProps = state => ({
    ...state.auth,
    ...state.admin
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    loadFormList: () => dispatch(loadFormList()),
    createForm: (e) => dispatch(createForm(e))
});

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(number){
    return "#"+((number)>>>0).toString(16).slice(-6);
}

class FormList extends React.Component<IFormListProps, IFormListState> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        console.log(props);
        this.state = {
            formList: []
        }
    }
    componentDidMount() {
        this.props.loadFormList();
    }
    showEmbedCode(formId) {

    }

   

    render() {
        let formList = this.props.selectedForm ? [this.props.selectedForm] : this.props.formList;
        const colors = ['#0088FE', '#00C49F'];
        if (!formList) {
            return <div>Loading</div>;
        }
        return (
            <div className="container-fluid">
                <div className="row">
                        <div className="col-sm text-center">
                            Right click on a form to perform an action.
                        </div>
                        <div className="col-sm text-center">
                            Last Modified Date
                        </div>
                        <div className="col-sm text-center">
                            Tags
                        </div>
                        <div className="col-sm text-center">
                            <FormNew onError={this.props.onError} />
                        </div>
                </div>
                {formList && formList.length == 0 && <tr><td>No forms found.</td></tr>}
                {formList && formList.map((form) =>
                        <React.Fragment key={form["_id"]["$oid"]}>
                            <ContextMenuTrigger id={form["_id"]["$oid"]}>
                                <div className="row" key={form["_id"]["$oid"]}>
                                    <div className="col-sm">{form["name"]}<br />
                                    </div>
                                    <div className="col-sm">
                                        {console.log(form)}
                                        {form["date_created"]["$date"]}
                                    </div>
                                    <div className="col-sm">
                                         {form["tags"].map((tag)=> <div className="badge badge-secondary" style={{backgroundColor: intToRGB(hashCode(tag))}}>{tag}</div>)}
                                    </div>
                                </div>
                            </ContextMenuTrigger>
                            <ContextMenu id={form["_id"]["$oid"]}>
                                <MenuItem data={{ foo: 'View' }} onClick={() =>
                                    history.push({ pathname: `/v2/forms/${form["_id"]["$oid"]}`, state: { selectedForm: form } })}>
                                    <span className="oi oi-document" />&nbsp;View
 			                </MenuItem>
                                <MenuItem data={{ foo: 'Embed' }} onClick={() => history.push({ pathname: `./${form["_id"]["$oid"]}/embed/`, state: { selectedForm: form } })}>
                                    <span className="oi oi-document" />&nbsp;Embed
                            </MenuItem>
                                <MenuItem divider />
                                <MenuItem data={{ foo: 'Edit' }} onClick={() =>
                                    history.push({ pathname: `./${form["_id"]["$oid"]}/edit/`, state: { selectedForm: form } })}>
                                    <span className="oi oi-pencil" />&nbsp;Edit
                            </MenuItem>
                                <MenuItem data={{ foo: 'Responses' }} onClick={() =>
                                    history.push({ pathname: `./${form["_id"]["$oid"]}/responses/`, state: { selectedForm: form } })}>
                                    <span className="oi oi-sort-ascending" />&nbsp;Responses
                            </MenuItem>
                                <MenuItem data={{ foo: 'Share' }} onClick={() =>
                                    history.push({ pathname: `./${form["_id"]["$oid"]}/share/`, state: { selectedForm: form } })}>
                                    <span className="oi oi-share-boxed" />&nbsp;Share
                            </MenuItem>
                                <MenuItem data={{ foo: 'Duplicate' }} onClick={() =>
                                    this.props.createForm(form._id.$oid)}>
                                    <span className="oi oi-plus" />&nbsp;
                                    Duplicate
                            </MenuItem>
                            </ContextMenu>
                        </React.Fragment>
                    )}
                
            </div>
        )
    }
}

function ActionButton(props) {
    let disabled = props.disabled || !hasPermission(props.form.cff_permissions, props.permissionName, props.userId);
    if (!props.permissionName) {
        disabled = false;
    }

    if (disabled) {
        return (<a href="">
            <button className="ccmt-cff-btn-action" disabled={true}>
                <span className={`oi ${props.icon}`}></span> {props.text}
            </button>
        </a>);
    }
    else {
        return (<NavLink to={{ pathname: `${props.url}`, state: { selectedForm: props.form } }}>
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

const FormListWrapper = connect(mapStateToProps, mapDispatchToProps)(FormList);
export default FormListWrapper;