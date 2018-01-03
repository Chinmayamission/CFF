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
            formId: null,
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

    loadForm(id) {
        this.setState({
            formId: id,
            status: STATUS_FORM_RENDER
        });
    }
    loadResponses(id) {
        this.setState({
            formId: id,
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
        return (
        <div className="App FormAdminPage">
            <h1>GCMW Form Admin - {this.state.center}</h1>
            {this.state.status == STATUS_FORM_LIST &&
                <FormList apiEndpoint={this.props.apiEndpoint} apiKey={this.props.apiKey}
                    loadForm = {(e) => this.loadForm(e)} loadResponses= {(e) => this.loadResponses(e)} 
                    formList = {this.state.formList} />
            }
            {this.state.status == STATUS_FORM_RENDER &&
                <FormPage formId = {this.state.formId} apiEndpoint={this.props.apiEndpoint}/>
            }
            {this.state.status == STATUS_FORM_RESPONSES &&
                <ResponseTable formId = {this.state.formId} apiKey={this.props.apiKey} apiEndpoint={this.props.apiEndpoint}/>
            }
        </div>
        );
    }
}

export default FormAdminPage;