import * as React from 'react';
import FormPage from "../form/FormPage";

var This;
class FormAdminPage extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        This = this;
        this.state = {
            center: {
                "name": "CMSJ"
            }
        }
    }
    render() {
        return (
        <div className="App FormAdminPage">
            <h1>GCMW Form Admin - {this.state.center.name}</h1>
            <FormPage formId={"5a3bdfd5059638058c8ef478"} />
        </div>
        );
    }
}

export default FormAdminPage;