/// <reference path="./FormEdit.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import FormLoader from "src/common/FormLoader";
import Loading from "src/common/Loading/Loading";
import JSONEditor from "./JSONEditor"
import VersionSelect from "./VersionSelect";
import { get, set, assign, isObject } from "lodash-es";

class FormEdit extends React.Component<IFormEditProps, IFormEditState> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            ajaxLoading: true,
            schemaModifier: null,
            schema: null,
            dataLoaded: false,
            formName: null,
            schema_versions: null,
            schemaModifier_versions: null,
        }
    }

    componentDidMount() {
        FormLoader.getForm(this.props.apiEndpoint, this.props.form.id, {"include_s_sm_versions": true})
        .then(({ name, center, schemaModifier, schema, schema_versions, schemaModifier_versions }) => {
            this.setState({
                schemaModifier,
                schema,
                schema_versions: schema_versions,
                schemaModifier_versions: schemaModifier_versions,
                ajaxLoading: false,
                dataLoaded: true,
                formName: name
            });
        });

    }
    getPath(params) {

    }
    onChange(path, data) {
        if (isObject(get(this.state, path))) {
            this.setState(set(assign({}, this.state), path, data));
        }
        else {
            alert("Error: " + path + " not found or not an object in state.");
        }
    }
    saveForm() {
        let dataToSend = {
            "schemaModifier": this.state.schemaModifier,
            "schema": this.state.schema,
            "name": this.state.formName
        };

        this.setState({ ajaxLoading: true });
        axios.post(this.props.apiEndpoint + "?action=formEdit&id="+this.props.form.id+"&version=1&apiKey=" + this.props.apiKey, dataToSend).then((response) => {
            let res = response.data.res;
            if (!(res.success == true && res.updated_values)) {
                throw "Response not formatted correctly: " + JSON.stringify(res);
            }
            this.setState({
                ajaxLoading: false,
                formName: res.updated_values.form.name || this.state.formName,
                schema: res.updated_values.schema || this.state.schema,
                schemaModifier: res.updated_values.schemaModifier || this.state.schemaModifier,
                schema_versions: res.updated_values.schema_versions || this.state.schema_versions,
                schemaModifier_versions: res.updated_values.schemaModifier_versions || this.state.schemaModifier_versions
            });
        }).catch(e => {
            this.setState({ ajaxLoading: false });
            console.error(e);
            alert("Error, " + e);
        })

    }
    onVersionSelect(path, version) { // path can be either "schema" or "schemaModifier"
        if (version == "NEW") {
            let updated = this.state[path];
            updated.version = "NEW";
            this.setState({
                [path]: updated
            });
            return;
        }
        this.setState({ ajaxLoading: true });
        let action = path + "Get"; // schemaGet or schemaModifierGet
        axios.get(
            this.props.apiEndpoint + "?action=" + action +
            "&id=" + this.state[path].id + 
            "&version=" + version
            ).then((response) => {
            let res = response.data.res;
            if (!res) {
                throw "Response not formatted correctly: " + JSON.stringify(res);
            }
            this.setState({
                ajaxLoading: false,
                [path]: res
            });
        }).catch(e => {
            this.setState({ ajaxLoading: false });
            console.error(e);
            alert("Error, " + e);
        });
    }
    render() {
        return (
            <div className="ccmt-cff-page-FormEdit">
                {this.state.ajaxLoading && <Loading />}
                {this.state.dataLoaded && <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 col-sm-6">
                            <label>Form Name</label>
                            <input className="form-control" value={this.state.formName}
                                onChange={(e) => this.setState({formName: e.target.value})} />
                            <label>Form Id</label><input className="form-control" disabled value={this.props.form.id} />
                        </div>
                        <div className="col-6 col-sm-3">
                            <VersionSelect
                                title={"Schema Modifier"}
                                value={this.state.schemaModifier.version}
                                versions={this.state.schemaModifier_versions}
                                onChange={(e) => this.onVersionSelect("schemaModifier", e.target.value)}
                            />
                            <VersionSelect
                                title={"Schema"}
                                value={this.state.schema.version}
                                versions={this.state.schema_versions}
                                onChange={(e) => this.onVersionSelect("schema", e.target.value)}
                            />
                        </div>
                        <div className="col-6 col-sm-3 p-4">
                            <button className="btn btn-lg btn-primary"
                                onClick={(e) => this.saveForm()} >Save Form</button>
                        </div>
                    </div>
                    <div className="row">
                        <JSONEditor
                            title={"Payment Info"}
                            data={this.state.schemaModifier.paymentInfo}
                            disabled={false}
                            onChange={(e) => this.onChange("schemaModifier.paymentInfo", e)}
                        />
                        <JSONEditor
                            title={"Payment Methods"}
                            data={this.state.schemaModifier.paymentMethods}
                            disabled={false}
                            onChange={(e) => this.onChange("schemaModifier.paymentMethods", e)}
                        />
                        <JSONEditor
                            title={"Confirmation Email Info"}
                            data={this.state.schemaModifier.confirmationEmailInfo}
                            disabled={false}
                            onChange={(e) => this.onChange("schemaModifier.confirmationEmailInfo", e)}
                        />
                        <JSONEditor
                            title={"Schema Modifier Value"}
                            data={this.state.schemaModifier.value}
                            disabled={false}
                            large={true}
                            onChange={(e) => this.onChange("schemaModifier.value", e)}
                        />
                        <JSONEditor
                            title={"Schema Value"}
                            data={this.state.schema.value}
                            disabled={false}
                            large={true}
                            onChange={(e) => this.onChange("schema.value", e)}
                        />
                    </div>
                </div>}
        </div>);
    }
}

export default FormEdit;