import * as React from 'react';
import FormPage from "../../form/FormPage";
import Loading from "../../common/Loading/Loading";
import JSONEditor from "./JSONEditor";
import { get, merge, cloneDeep } from "lodash";
import dataLoadingView from "../util/DataLoadingView";
import { API } from "aws-amplify";
import { IFormEditProps, IFormEditState } from "./FormEdit.d";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import "./FormEdit.scss";
import SplitterLayout from 'react-splitter-layout';
import CustomForm from '../../form/CustomForm';
class FormEdit extends React.Component<IFormEditProps, IFormEditState> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        let form = props.data.res;
        this.state = {
            schema: get(form, "schema", {}),
            uiSchema: get(form, "uiSchema", {}),
            formOptions: get(form, "formOptions", { "paymentInfo": {}, "confirmationEmailInfo": {}, "paymentMethods": {} }),
            formName: get(form, "name", "None"),
            loading: false,
            changeFromEditor: false,
            hasError: false,
            errorMessage: ""
        }
    }
    onChange(path, data, {changeFromEditor=false, partial=false}) {
        let state = cloneDeep(this.state);
        if (partial) {
            for (let key in data) {
                state[path][key] = data[key];
            }
        }
        else {
            state[path] = data;
        }
        state.changeFromEditor = changeFromEditor;
        state.hasError = false;
        state.errorMessage = "";
        this.setState(state);
    }
    onJSONError(path, message) {
        this.setState({
            hasError: true,
            errorMessage: `Error in ${path}: ${message}`
        });
    }

    saveForm() {
        if (this.state.hasError) {
            alert(`Can't save form. ${this.state.errorMessage}`);
            return;
        }
        this.setState({ loading: true });
        API.patch("CFF", `forms/${this.props.match.params.formId}`, {
            "body": {
                "uiSchema": this.state.uiSchema,
                "schema": this.state.schema,
                "formOptions": this.state.formOptions,
                "name": this.state.formName,
            }
        }).then((response) => {
            let res = response.res;
            if (!(res.success == true && res.updated_values)) {
                throw "Response not formatted correctly: " + JSON.stringify(res);
            }
            this.setState({ loading: false });
            // this.setState({
            //     loading: false,
            //     formName: formName,
            //     schema: schema,
            //     uiSchema: uiSchema,
            //     formOptions: formOptions
            // });
        }).catch(e => {
            alert("ERROR");
            this.setState({ loading: false });
            console.error(e);
            alert("Error, " + e);
        })

    }

    changeFormName(newName) {
        this.setState({ formName: newName });
    }
    renderTopPane() {
        return (
            <div>
                <div className="form-inline">
                    <input className="form-control form-control-sm" value={this.state.formName}
                        placeholder="Form Name"
                        onChange={(e) => this.changeFormName(e.target.value)} />
                    <button className="btn btn-sm btn-outline-primary"
                        onClick={(e) => this.saveForm()} >Save Form</button>
                    {get(this.state.formOptions, "dataOptions.export") && this.state.formOptions.dataOptions.export.map(e =>
                        e.type === "google_sheets" && e.spreadsheetId && (
                            <div><a target="_blank" href={`https://docs.google.com/spreadsheets/d/${e.spreadsheetId}`}>Export {e.type} link</a></div>
                        ))}
                </div>
            </div>
        );
    }
    render() {
        return (
            <div className="ccmt-cff-page-FormEdit">
                {this.state.loading && <Loading />}
                <div className="container-fluid">
                    <div className="row">
                        <SplitterLayout vertical={true} customClassName="ccmt-cff-editpage-splitter"
                        onSecondaryPaneSizeChange={() => window.dispatchEvent(new Event('resize'))}
                        >
                            <div className="col-12 ccmt-cff-editpage-jsoneditor-container">
                                <Tabs>
                                    <TabList>
                                        {/* <Tab>Form Options</Tab> */}
                                        <Tab>Form Options (JSON)</Tab>
                                        <Tab>Schema (JSON)</Tab>
                                        <Tab>UiSchema (JSON)</Tab>
                                        <li className="react-tabs__tab">
                                        {this.renderTopPane()}
                                        </li>
                                    </TabList>
                                    {/* <TabPanel>
                                        <CustomForm schema={require("./formOptions.schema.json")}
                                            uiSchema={require("./formOptions.uiSchema.json")}
                                            formData={this.state.formOptions}
                                            onSubmit={(e) => this.onChange("formOptions", e, {partial: true})}
                                        />
                                    </TabPanel> */}
                                    <TabPanel>
                                        <JSONEditor
                                            data={this.state.formOptions}
                                            changeFromEditor={this.state.changeFromEditor}
                                            onChange={(e) => this.onChange("formOptions", e, {changeFromEditor: true})}
                                            onJSONError={e => this.onJSONError("formOptions", e)}
                                        />
                                    </TabPanel>
                                    <TabPanel>
                                        <JSONEditor
                                            data={this.state.schema}
                                            changeFromEditor={this.state.changeFromEditor}
                                            onChange={(e) => this.onChange("schema", e, {changeFromEditor: true})}
                                            onJSONError={e => this.onJSONError("schema", e)}
                                        />
                                    </TabPanel>
                                    <TabPanel>
                                        <JSONEditor
                                            data={this.state.uiSchema}
                                            changeFromEditor={this.state.changeFromEditor}
                                            onChange={(e) => this.onChange("uiSchema", e, {changeFromEditor: true})}
                                            onJSONError={e => this.onJSONError("uiSchema", e)}
                                        />
                                    </TabPanel>
                                </Tabs>
                            </div>
                        </SplitterLayout>
                    </div>
                </div>
            </div>);
    }
}

export default dataLoadingView(FormEdit, (props) => {
    return API.get("CFF", `forms/${props.formId}`, {});
});