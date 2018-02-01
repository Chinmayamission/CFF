/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import {flatten} from 'flat';
import * as queryString from "query-string";
import {pick, get, set} from "lodash-es";
import FormPage from "../form/FormPage";
import FormEmbed from "./FormEmbed";
import FormList from "./FormList";
import FormEdit from "./FormEdit/FormEdit";
import ResponseTable from "./ResponseTable";
import Loading from "src/common/Loading/Loading";
import MockData from "src/common/util/MockData";
import "./admin.scss";
import { withAuthenticator } from 'aws-amplify-react';
import { Auth } from 'aws-amplify';

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
            status: STATUS_LOADING,
            hasError: false,
            apiKey: this.props.authData.id
        }
    }

    getFormList(url) {
        return axios.get(url, {"responseType": "json"})
        .catch(e => {
            if ((window as any).CCMT_CFF_DEVMODE===true) {
                console.log(MockData.formList);
                return MockData.formList;
            }
            alert("Error loading the form list. " + e);
        })
        .then((response) => {
            console.log(response.data);
            this.setState({formList: response.data.res, status: STATUS_FORM_LIST});
        })
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
        let stateKeysToEncode = ["selectedForm.name", "selectedForm.center", "selectedForm.id", "status"];
        if (pick(this.state, stateKeysToEncode) != pick(prevState, stateKeysToEncode)) {
            let encodedState = flatten(pick(this.state, stateKeysToEncode));
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
        this.loadFormList();
        console.log(this.props.authState, this.props.authData);
    }
    loadFormList() {
        let queryObjFlat = queryString.parse(window.location.hash);
        let formListUrl = this.props.apiEndpoint + "?action=formList&apiKey=" + this.state.apiKey;
        //this.getFormList(formListUrl).then((e) =>{
        let queryObjNested : any = {};
        for (let path in queryObjFlat) {
            set(queryObjNested, path, queryObjFlat[path]);
        }
        if (!queryObjNested.status || queryObjNested.status == STATUS_FORM_LIST) {
            this.getFormList(formListUrl).then(e => {
                this.setState(queryObjNested);
            });
        }
        else {
            this.setState(queryObjNested);
        }
    }
    handleError(e) {
        this.setState({"hasError": true});
    }
    render() {
        var that = this;
        if (this.state.status == STATUS_LOADING) {
            return <Loading hasError={this.state.hasError} />;
        }
        return (
        <div className="App FormAdminPage">
            <h1>CCMT Form Admin - {this.state.center}</h1>
            {this.state.status != STATUS_FORM_LIST && 
                <a href="#" onClick={() => {window.location.hash=""; this.loadFormList(); } }>Back to form list</a>
            }
            <FormList
                apiEndpoint={this.props.apiEndpoint}
                apiKey={this.state.apiKey}
                editForm = {(e) => this.editForm(e)}
                embedForm = {(e) => this.embedForm(e)}
                loadResponses= {(e) => this.loadResponses(e)} 
                formList = {this.state.status == STATUS_FORM_LIST ? this.state.formList : [this.state.selectedForm]} />
            {this.state.status == STATUS_FORM_EMBED && 
                <FormEmbed form={this.state.selectedForm} apiEndpoint={this.props.apiEndpoint} />
            }
            {this.state.status == STATUS_FORM_EDIT && 
                <FormEdit form={this.state.selectedForm} apiEndpoint={this.props.apiEndpoint} apiKey={this.state.apiKey} />
            }
            {this.state.status == STATUS_FORM_RESPONSES &&
                <ResponseTable form={this.state.selectedForm} apiEndpoint={this.props.apiEndpoint} apiKey={this.state.apiKey}
                    handleError={(e) => this.handleError(e)} />
            }
        </div>
        );
    }
}

export default withAuthenticator(FormAdminPage, { includeGreetings: true });