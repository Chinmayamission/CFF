import * as React from 'react';
import axios from 'axios';
import FormLoader from "src/common/FormLoader";
import FormPage from "src/form/FormPage";
import Loading from "src/common/Loading/Loading";
// import * as difflet from "difflet";
import JSONEditor from "./JSONEditor";
import { get, set, assign, pick } from "lodash-es";
import Modal from 'react-responsive-modal';
import dataLoadingView from "../util/DataLoadingView";
import { API } from "aws-amplify";
import { IFormEditProps, IFormEditState } from "./FormEdit.d";

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
            loading: false
        }
    }
    onChange(path, data) {
        this.setState(set(assign({}, this.state), path, data));
    }
    saveForm() {
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
            <div className="row">
                <div className="col-12 col-sm-6">
                    <label>Form Name</label>
                    <input className="form-control" value={this.state.formName}
                        onChange={(e) => this.changeFormName(e.target.value)} />
                    <label>Form Id</label><input className="form-control" disabled value={this.props.match.params.formId} />
                </div>
                <div className="col-6 col-sm-3 p-4">
                    <button className="btn btn-lg btn-primary"
                        onClick={(e) => this.saveForm()} >Save Form</button>
                </div>
            </div>
        );
    }
    render() {
        return (
            <div className="ccmt-cff-page-FormEdit">
                {this.state.loading && <Loading />}
                <div className="container-fluid">
                    {this.renderTopPane()}
                    <div className="row">
                        <JSONEditor
                            title={"Form Options"}
                            data={this.state.formOptions}
                            disabled={false}
                            large={true}
                            onChange={(e) => this.onChange("formOptions", e)}
                        />
                        <JSONEditor
                            title={"UiSchema Value"}
                            data={this.state.uiSchema}
                            disabled={false}
                            large={true}
                            onChange={(e) => this.onChange("uiSchema", e)}
                        />
                        <JSONEditor
                            title={"Schema Value"}
                            data={this.state.schema}
                            disabled={false}
                            large={true}
                            onChange={(e) => this.onChange("schema", e)}
                        />
                        <div className="col-12 col-sm-6">
                            <FormPage formId={this.props.match.params.formId} key={JSON.stringify(this.state)} form_preloaded={pick(this.state, ["schema", "uiSchema", "formOptions"])} />
                        </div>
                    </div>
                    {this.renderTopPane()}
                </div>
            </div>);
    }
}

export default dataLoadingView(FormEdit, (props) => {
    return API.get("CFF", `forms/${props.formId}`, {});
});