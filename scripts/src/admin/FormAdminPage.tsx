/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import FormPage from "../form/FormPage";
import FormList from "./FormList";
import ResponseTable from "./ResponseTable";
import {
    Route,
    Link
  } from 'react-router-dom'
import Loading from "src/common/loading";

const STATUS_LOADING = 0;
const STATUS_FORM_LIST = 1;
const STATUS_FORM_RENDER = 2;
const STATUS_FORM_RESPONSES = 3;

class FormAdminPage extends React.Component<IFormAdminPageProps, IFormAdminPageState> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            formList: [],
            center: "CMSJ",
            selectedForm: null,
            status: STATUS_LOADING
        }
    }

    getFormList(url) {
        var that = this;
        axios.get(url, {"responseType": "json"})
        .then((response) => {
            console.log(response.data);
            that.setState({formList: response.data.res, status: STATUS_FORM_LIST});
        });
    }

    loadForm(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_RENDER
        });
    }
    loadResponses(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_RESPONSES
        });
    }
    componentDidMount() {
        let formListUrl = this.props.apiEndpoint + "?action=formList&apiKey=" + this.props.apiKey;
        this.getFormList(formListUrl);
    }
    getPath(params) {
        return window.location.pathname + "?" + window.location.href.split("?")[1] + "&" + params;
    }
    render() {
        var that = this;
        if (this.state.status == STATUS_LOADING) {
            return <Loading />;
        }
        return (
        <div className="App FormAdminPage">
            <h1>CCMT Form Admin - {this.state.center}</h1>
            <FormList apiEndpoint={this.props.apiEndpoint} apiKey={this.props.apiKey}
                loadForm = {(e) => this.loadForm(e)} loadResponses= {(e) => this.loadResponses(e)} 
                formList = {this.state.status == STATUS_FORM_LIST ? this.state.formList : [this.state.selectedForm]} />
            {this.state.status == STATUS_FORM_RENDER &&
                <FormPage formId = {this.state.selectedForm._id} apiEndpoint={this.props.apiEndpoint}/>
            }
            {this.state.status == STATUS_FORM_RESPONSES &&
                <ResponseTable formId = {this.state.selectedForm._id} apiKey={this.props.apiKey} apiEndpoint={this.props.apiEndpoint}/>
            }
        </div>
        );
    }
}

export default FormAdminPage;