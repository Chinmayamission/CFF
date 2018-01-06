/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import JSONEditor from "./components/JSONEditor"
import FormLoader from "src/common/FormLoader";
import Loading from "src/common/loading";

class FormEdit extends React.Component<IFormEditProps, IFormEditState> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            loading: true,
            schemaModifier: null,
            schema: null
        }
    }

    componentDidMount() {
        let formLoader = new FormLoader();
        formLoader.getForm(this.props.apiEndpoint, this.props.form._id['$oid']).then(({ schemaModifier, schema }) => {
            this.setState({
                schemaModifier,
                schema,
                loading: false
            });
        });
    }
    getPath(params) {

    }
    render() {
        if (this.state.loading) {
            return <Loading />;
        }
        return <div className="ccmt-cff-page-FormEdit">
            {this.props.form.name} - {this.props.form._id.$oid}
            <div style={{ "display": "flex" }}>
                <JSONEditor data={this.state.schemaModifier} />
                <JSONEditor data={this.state.schema} />
            </div>
        </div>;
    }
}

export default FormEdit;