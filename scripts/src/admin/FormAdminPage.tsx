import * as React from 'react';
import axios from 'axios';
import FormPage from "../form/FormPage";
import ResponseTable from "./ResponseTable";
import {
    Route,
    Link
  } from 'react-router-dom'

const endpoint = "https://ajd5vh06d8.execute-api.us-east-2.amazonaws.com/prod/gcmw-cff-render-form";
const apiKey = 'test';

const STATUS_LOADING = 0;
const STATUS_FORM_LIST = 1;
const STATUS_FORM_RENDER = 2;
const STATUS_FORM_RESPONSES = 3;

class FormAdminPage extends React.Component<any, any> {
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
        let formListUrl = endpoint + "?action=formList&apiKey=" + apiKey;
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
            <ul>
                <li><Link to={this.getPath("a=b")}>Home</Link></li>
                <li><Link to="./about">About</Link></li>
                <li><Link to="./topics">Topics</Link></li>
            </ul>
            {this.state.status == STATUS_FORM_LIST &&
            <table className="wp-list-table widefat fixed">
                <thead>
                    <tr>
                        <td>Form name</td>
                        <td>Actions</td>
                    </tr>
                </thead>
                <tbody>
                    {this.state.formList.map((form) => 
                        <tr key={form["_id"]["$oid"]} style = {{outline: 'thin solid'}}>
                            <td>{form["name"]}</td>
                            <td>
                                <button className="button button-primary" onClick = {() => this.loadForm(form["_id"])}>View</button>
                                <button className="button">Edit</button>
                                <button className="button" onClick = {() => this.loadResponses(form["_id"])}>View Responses</button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>}
            {this.state.status == STATUS_FORM_RENDER && <FormPage formId = {this.state.formId} />}
            {this.state.status == STATUS_FORM_RESPONSES && <ResponseTable formId = {this.state.formId}/>}
        <Route path="./id" component={FormPage} />
        </div>
        );
    }
}

export default FormAdminPage;