import * as React from 'react';
import axios from 'axios';
import FormPage from "../form/FormPage";

class FormAdminPage extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.getFormList = this.getFormList.bind(this);
        this.getSchemas = this.getSchemas.bind(this);
        this.state = {
            formList: [],
            center: "CMSJ",
            formId: null
        }
    }
    getSchemas() {
        var that = this;
        let formListUrl = 'https://ajd5vh06d8.execute-api.us-east-2.amazonaws.com/prod/gcmw-cff-render-form?action=formRender&id=59dbf12b734d1d18c05ebd21';
        axios.get(formListUrl, {"responseType": "json"})
        .then((response) => {
            const resp = response.data.res[0];
            console.log(formListUrl);
            console.log(response.data);
            console.log(resp["schema"]);
            console.log(resp["schemaModifier"]);
        });
    }
    getFormList(url) {
        var that = this;
        axios.get(url, {"responseType": "json"})
        .then((response) => {
            console.log(response.data);
            that.setState({formList: response.data.res});
        });
    }

    loadForm(id) {
        this.setState({formId: id});
        console.log("setting state", id);
    }
    componentDidMount() {
        let endpoint = 'https://ajd5vh06d8.execute-api.us-east-2.amazonaws.com/prod/gcmw-cff-render-form';
        let apiKey = 'test';
        let formListUrl = endpoint + "?action=formList&apiKey=" + apiKey;
        this.getFormList(formListUrl);
    }
    render() {
        var that = this;
        return (
        <div className="App FormAdminPage">
            <h1>GCMW Form Admin - {this.state.center}</h1>
            <button onClick = {() =>this.getSchemas()} >Render</button>
            <table>
                <tbody>
                    {this.state.formList.map((form) =>
                        <tr key = {form["_id"]["$oid"]} style = {{outline: 'thin solid'}}>
                            <td>{form["name"]}</td>
                            <td><button onClick = {() => this.loadForm(form["_id"]["$oid"])}>View</button></td>
                            <td><button>Edit</button></td>
                            <td><button>View Responses</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
            {this.state.formId != null && <FormPage formId = {{"$oid": this.state.formId}} />}
        </div>
        );
    }
}

export default FormAdminPage;