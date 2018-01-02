import * as React from 'react';
//import FormPage from "../form/FormPage";

class FormAdminPage extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            formList: [],
            center: "CMSJ"
        }
    }

    componentDidMount() {
        this.setState({
            formList: [
            {"id": "129318954835", "name": "mah form"},
            {"id": "465738945468", "name": "moo"}
        ]
        });
    }
    render() {
        return (
        <div className="App FormAdminPage">
            <h1>GCMW Form Admin - {this.state.center}</h1>
            <table>
                <tbody>
                    {this.state.formList.map((form) =>
                        <tr key = {form["id"]}>
                            <td style = {{border: '1px solid black'}}>{form["name"]}</td>
                            <td><button>View</button></td>
                            <td><button>Edit</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/*<FormPage formId={"5a3bdfd5059638058c8ef478"} />*/}
        </div>
        );
    }
}

export default FormAdminPage;