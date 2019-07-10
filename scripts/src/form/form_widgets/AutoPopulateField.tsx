import * as React from "react";
import { get, every, isEqual, isEmpty, pick } from "lodash";
import Loading from "../../common/Loading/Loading";
import Form from "react-jsonschema-form";
import CustomForm from "../CustomForm";
import "./AutoPopulateField.scss";

const cache = {};
class AutoPopulateField extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            error: ""
        }
    }
    async componentDidMount() {
        try {
            let titleAccessor = this.props.uiSchema["ui:options"]["cff:autoPopulateTitleAccessor"];
            let endpoint = this.props.uiSchema["ui:options"]["cff:autoPopulateEndpoint"];
            let results = cache[endpoint] || await fetch(endpoint).then(e => e.json());
            cache[endpoint] = results;
            let options:any = [{"title": this.props.uiSchema["ui:placeholder"] || `Select ${this.props.name}` }];
            for (let result of results) {
                let option = {"type": typeof result, "properties": {} };
                if (titleAccessor) {
                    option["title"] = get(result, titleAccessor);
                }
                if (this.props.schema.type === "object") {
                    for (let key in this.props.schema.properties) {
                        option["properties"][key] = {"type": typeof result[key], "default": result[key], "readOnly": true, "const": result[key]};
                    }
                }
                // TODO: work with arrays.
                else {
                    option = result;
                }
                // TODO: change this to pass in formData in a prop when bug in rjsf is fixed -- passing formData to OneOf does not select that option, and also defaults for oneOf do not work.
                if (!every(this.props.formData, isEmpty) && isEqual(pick(result, Object.keys(this.props.schema.properties)), this.props.formData)) {
                    options.unshift(option);
                }
                else {
                    options.push(option);
                }
            }
            let newSchema = {
                "type": "object",
                "oneOf": options
            };
            this.setState({
                loading: false,
                newSchema
            });
        }
        catch (e) {
            console.error(e);
            this.setState({
                loading: false,
                error: "An error occurred. Please try again later."
            });
        }
    }
    render() {
        if (this.state.loading) {
            return <Loading />;
        }
        if (this.state.error) {
            return <div style={{ "color": "red" }}>{this.state.error}</div>
        }
        let {"ui:field": field, ...uiSchema} = this.props.uiSchema;
        return (<div className="col-12">
            <label className="control-label">{this.props.uiSchema["ui:title"] || this.props.schema.title || ""}</label>
            <CustomForm
                schema={this.state.newSchema}
                tagName={"div"}
                uiSchema={uiSchema}
                formData={this.props.formData}
                className={"ccmt-cff-Page-SubFormPage-AutoPopulate"}
                onChange={e => this.props.onChange(e.formData)}>&nbsp;</CustomForm>
        </div>);
    }
};
export default AutoPopulateField;
