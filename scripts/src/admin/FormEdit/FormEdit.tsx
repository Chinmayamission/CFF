/// <reference path="./FormEdit.d.ts"/>
import * as React from 'react';
import FormPage from "src/form/FormPage";
import Loading from "src/common/Loading/Loading";
import { cloneDeep, zipObject } from "lodash-es";
import dataLoadingView from "../util/DataLoadingView";
import {API} from "aws-amplify";
import "./FormEdit.scss";
import "src/form/form.scss";
import Form from "react-jsonschema-form";
import ArrayFieldTemplate from "src/form/form_templates/ArrayFieldTemplate";
import ObjectFieldTemplate from "src/form/form_templates/ObjectFieldTemplate";
import CustomFieldTemplate from "src/form/form_templates/CustomFieldTemplate";

class FormEdit extends React.Component<IFormEditProps, IFormEditState> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        let form = cloneDeep(this.props.data.res);
        form.schema.properties = Object.keys(form.schema.properties).map(key => ({key, value: form.schema.properties[key]}));
        this.state = {
            ajaxLoading: false,
            form: cloneDeep(this.props.data.res),
            input_form: form,
            original_form: this.props.data.res
        }
    }
    componentDidMount() {

    }
    getPath(params) {

    }
    saveForm() {
        this.setState({ ajaxLoading: true });
        API.post("CFF", `forms/${this.props.formId}`, {
            "body": {
                // "schemaModifier": this.state.schemaModifier,
                // "schema": this.state.schema,
                // "name": this.state.formName,
                // "couponCodes": this.state.couponCodes
            }
        }).then((response) => {
            let res = response.res;
            if (!(res.success == true && res.form)) {
                throw "Response not formatted correctly: " + JSON.stringify(res);
            }
            let form = res.form;
            this.setState({
                ajaxLoading: false,
                form
            });
        }).catch(e => {
            this.setState({ ajaxLoading: false });
            console.error(e);
            alert("Error, " + e);
        });
    }
    onChange(path, formData) {
        let keys = formData.properties.map(e => e.key);
        let values = formData.properties.map(e => e.value);
        formData.properties = zipObject(keys, values);
        console.log(formData.properties, this.state.original_form.schema.properties);
    }
    render() {
        let schema = {
            "title": "Edit Schema",
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                // "id": {"type": "string"},
                "type": {"type": "string"},
                "description": {"type": "string"},
                "properties": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "key": {"type": "string"},
                            "value": {
                                "type": "object",
                                "properties": {
                                    "type": {"type": "string", "enum": ["boolean", "string", "object"]},
                                    "title": {"type": "string"},
                                    "default": {"type": "string"}
                                },
                                "dependencies": {
                                    "type": {
                                        "oneOf": [
                                            {
                                                "properties": {
                                                    "type": {"enum": ["object", "boolean"]}
                                                }
                                            },
                                            {
                                                "properties": {
                                                    "type": {"enum": ["string"]},
                                                    "format": {"type": "string", "enum": ["email", "uri", "data-url", "alt-date", "alt-datetime", "date", "date-time"]}
                                                }
                                            },
                                            {
                                                "properties": {
                                                    "type": {"enum": ["number"]},
                                                    "format": {"type": "string", "enum": ["updown", "range", "radio"]}
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        let uiSchema = {
            "id": {"ui:readonly": true},
            "properties": {
                "items": {
                    "key": {"classNames": "col-12 col-sm-6 col-md-3"},
                    "value": {
                        "type": {"classNames": "col-12 col-sm-4 col-md-2"},
                        "format": {"classNames": "col-12 col-sm-4 col-md-2"},
                        "title": {"classNames": "col-12 col-sm-4 col-md-2"},
                        "default": {"classNames": "col-12 col-sm-4 col-md-2"}
                    }
                },
                "ui:options":  {
                    orderable: true,
                    addable: true
                }
            }
        }
        
        return (
            <div className="ccmt-cff-page-FormEdit">
                <div className="row">
                    <div className="col-12 col-sm-6 ccmt-cff-FormEdit-half">
                        <Form schema={schema} uiSchema={uiSchema}
                            ArrayFieldTemplate={ArrayFieldTemplate}
                            CustomFieldTemplate={CustomFieldTemplate}
                            ObjectFieldTemplate={ObjectFieldTemplate}
                            formData={this.state.input_form.schema}
                            onChange={e => this.onChange("schema", e.formData)}
                        />
                    </div>
                    <div className="col-12 col-sm-6 ccmt-cff-FormEdit-half">
                        <FormPage form_preloaded={this.state.form} />
                    </div>
                </div>
            </div>
        );
    }
}

export default dataLoadingView(FormEdit, (props) => {
    return API.get("CFF", `forms/${props.formId}/render`, {});
});