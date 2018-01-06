/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import {flatten} from 'flat';
import * as queryString from "query-string";
import {pick, get, set} from "lodash-es";
import FormPage from "../form/FormPage";
import FormEmbed from "./FormEmbed";
import FormList from "./FormList";
import FormEdit from "./FormEdit";
import ResponseTable from "./ResponseTable";
import Loading from "src/common/loading";

const STATUS_LOADING = 0;
const STATUS_FORM_LIST = 1;
const STATUS_FORM_RENDER = 2; // Not used.
const STATUS_FORM_RESPONSES = 3;
const STATUS_FORM_EMBED = 4;
const STATUS_FORM_EDIT = 5;

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
        return axios.get(url, {"responseType": "json"})
        .then((response) => {
            console.log(response.data);
            this.setState({formList: response.data.res, status: STATUS_FORM_LIST});
        });
    }

    editForm(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_EDIT
        });
    }

    embedForm(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_EMBED
        })
    }

    componentDidUpdate(prevProps, prevState) {
        let propsToEncode = ["selectedForm", "status"];
        if (pick(this.state, propsToEncode) != pick(prevState, propsToEncode)) {
            let encodedState = flatten(pick(this.state, ["selectedForm", "status"]));
            let newQS = queryString.stringify(encodedState);
            window.location.hash = newQS;//queryString.stringify(encodedState);   
        }
    }


    loadResponses(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_RESPONSES
        });
    }
    componentDidMount() {
        let queryObjFlat = queryString.parse(location.hash);

        let formListUrl = this.props.apiEndpoint + "?action=formList&apiKey=" + this.props.apiKey;
        this.getFormList(formListUrl).then((e) =>{
            let queryObjNested = {};
            for (let path in queryObjFlat) {
                set(queryObjNested, path, queryObjFlat[path]);
            }
            this.setState(queryObjNested);
        });
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
            <FormList
                apiEndpoint={this.props.apiEndpoint}
                apiKey={this.props.apiKey}
                editForm = {(e) => this.editForm(e)}
                embedForm = {(e) => this.embedForm(e)}
                loadResponses= {(e) => this.loadResponses(e)} 
                formList = {this.state.status == STATUS_FORM_LIST ? this.state.formList : [this.state.selectedForm]} />
            {this.state.status == STATUS_FORM_EMBED && 
                <FormEmbed form={this.state.selectedForm} apiEndpoint={this.props.apiEndpoint} />
            }
            {this.state.status == STATUS_FORM_EDIT && 
                <FormEdit form={this.state.selectedForm} apiEndpoint={this.props.apiEndpoint} apiKey={this.props.apiKey} />
            }
            {this.state.status == STATUS_FORM_RESPONSES &&
                <ResponseTable formId = {this.state.selectedForm._id} apiEndpoint={this.props.apiEndpoint} apiKey={this.props.apiKey} />
            }
        </div>
        );
    }
}

export default FormAdminPage;