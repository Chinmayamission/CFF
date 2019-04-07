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
import Loading from '../../common/Loading/Loading';

const  mapStateToProps = state => ({
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
            highlightedForm : ''
        }
    }
    componentDidMount() {
        this.props.loadFormList();
    }
    showEmbedCode(formId) {

    }
    delete(forms,formId) {
        if (confirm("Are you sure you want to delete this form (this cannot be undone)?")) {
            API.del("CFF", `/forms/${formId}`, {}).then(e => {
                alert("Form deleted!");
                window.location.reload();
            }).catch(e => {
                alert(`Delete failed: ${e}`);
            });
        }
    }
    highlightForm(formId){
        this.setState({highlightedForm: formId})
        
    }
    render() {
        let formList = this.props.selectedForm ? [this.props.selectedForm] : this.props.formList;
        
        if (!formList) {
            return(<Loading />);
        }
        return (
            <div className="container-fluid">
                <div className="row">
                        <div className="col-sm">
                            Right click on a form to perform an action.
                        </div>
                        <div className="col-sm">
                            Date Last Modified
                        </div>
                        <div className="col-sm">
                            Date Created
                        </div>
                        {/* <div className="col-sm">
                            Tags
                        </div> */}
                        <div className="col-sm">
                            <FormNew onError={this.props.onError} />
                        </div>
                </div>
                {formList && formList.length == 0 && "No forms found."}
                {formList && formList.map((form) =>
                        <React.Fragment key={form["_id"]["$oid"]}>
                            <ContextMenuTrigger id={form["_id"]["$oid"]}>
                                <div className="row" style={{padding: 10, backgroundColor: form["_id"]["$oid"] === this.state.highlightedForm ? "lightblue": "white"}} onClick={() => this.highlightForm(form["_id"]["$oid"])} key={form["_id"]["$oid"]}
                                  onContextMenu={() => this.highlightForm(form["_id"]["$oid"])}>
                                    <div className="col-sm">{form["name"]}
                                    </div>
                                    <div className="col-sm">
                                        {new Date(form["date_modified"]["$date"]).toLocaleDateString()}
                                    </div>
                                    <div className="col-sm">
                                        {new Date(form["date_created"]["$date"]).toLocaleDateString()}
                                    </div>
                                    <div className="col-sm">
                                         {form["tags"] && form["tags"].map((tag)=> <div className="badge badge-secondary" style={{backgroundColor: intToRGB(hashCode(tag))}}>{tag}</div>)}
                                    </div>
                                </div>
                             
                            </ContextMenuTrigger>
                            <ContextMenu id={form["_id"]["$oid"]}>
                                <MenuItem  onClick={() =>
                                    history.push({ pathname: `/v2/forms/${form["_id"]["$oid"]}`, state: { selectedForm: form } })}>
                                    <span className="oi oi-document" />&nbsp;View
 			                </MenuItem>
                                <MenuItem  onClick={() => history.push({ pathname: `./${form["_id"]["$oid"]}/embed/`, state: { selectedForm: form } })}>
                                    <span className="oi oi-document" />&nbsp;Embed
                            </MenuItem>
                                <MenuItem divider />
                                <MenuItem  onClick={() =>
                                    history.push({ pathname: `./${form["_id"]["$oid"]}/edit/`, state: { selectedForm: form } })}>
                                    <span className="oi oi-pencil" />&nbsp;Edit
                            </MenuItem>
                                <MenuItem  onClick={() =>
                                    history.push({ pathname: `./${form["_id"]["$oid"]}/responses/`, state: { selectedForm: form } })}>
                                    <span className="oi oi-sort-ascending" />&nbsp;Responses
                            </MenuItem>
                                <MenuItem  onClick={() =>
                                    history.push({ pathname: `./${form["_id"]["$oid"]}/share/`, state: { selectedForm: form } })}>
                                    <span className="oi oi-share-boxed" />&nbsp;Share
                            </MenuItem>
                                <MenuItem  onClick={() =>
                                    this.props.createForm(form._id.$oid)}>
                                    <span className="oi oi-plus" />&nbsp;
                                    Duplicate
                            </MenuItem>
                            <MenuItem data={{ foo: 'Delete' }} onClick={() => {this.delete(formList,form["_id"]["$oid"])}}>
                                   <span className="oi oi-minus" />&nbsp;
                                    Delete
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
