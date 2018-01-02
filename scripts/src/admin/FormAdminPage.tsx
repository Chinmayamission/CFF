import * as React from 'react';
import axios from 'axios';
import FormPage from "../form/FormPage";

class FormAdminPage extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.getFormList = this.getFormList.bind(this);
        this.state = {
            formList: [],
            center: "CMSJ"
        }
    }

    getFormList(url) {
        var that = this;
        axios.get(url, {"responseType": "json"})
        .then((response) => {
            console.log(response.data);
            that.setState({formList: response.data.res});
        })
    }

    componentDidMount() {
        let formListUrl = 'https://ajd5vh06d8.execute-api.us-east-2.amazonaws.com/dev/gcmw-cff-render-form?action=renderForm&id=59dbf12b734d1d18c05ebd21';

        //axios.get(formListUrl, {"responseType": "json"})
        //.then((response) => {
        //    console.log(response.data)
        //});
        this.setState({
            formList: [
            {"id": "129318954835", "name": "mah form"},
            {"id": "465738945468", "name": "moo"}
        ]
        });
        this.getFormList(formListUrl);
    }
    render() {
        return (
        <div className="App FormAdminPage">
            <h1>GCMW Form Admin - {this.state.center}</h1>
            <button>Render</button>
            <table>
                <tbody>
                    {this.state.formList.map((form) =>
                        <tr key = {form["id"]} style = {{outline: 'thin solid'}}>
                            <td>{form["name"]}</td>
                            <td><button>View</button></td>
                            <td><button>Edit</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
            <FormPage formId={"5a3bdfd5059638058c8ef478"} />
        </div>
        );
    }
}

export default FormAdminPage;