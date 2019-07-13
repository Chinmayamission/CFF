import * as React from "react";
import { get, sortBy } from "lodash";
import Loading from "../../common/Loading/Loading";
import CustomForm from "../CustomForm";
import "./AutoPopulateField.scss";

class AutoPopulateField extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      loading: true,
      error: ""
    };
  }
  async componentDidMount() {
    try {
      let titleAccessor = this.props.uiSchema["ui:options"][
        "cff:autoPopulateTitleAccessor"
      ];
      let endpoint = this.props.uiSchema["ui:options"][
        "cff:autoPopulateEndpoint"
      ];
      let results =
        window.sessionStorage &&
        JSON.parse(sessionStorage.getItem(endpoint) || "null");
      if (!results) {
        results = await fetch(endpoint).then(e => e.json());
        sessionStorage.setItem(endpoint, JSON.stringify(results));
      }
      let options: any = [];
      // options.push(
      //     {"title": this.props.uiSchema["ui:placeholder"] || `Select ${this.props.name}`, "type": "object", "properties": {"a": {"type": "string"}}, "required": ["a"] }
      // );
      for (let result of results) {
        let option = { properties: {} };
        if (this.props.schema.type === "object") {
          // Always true for now.
          for (let key in this.props.schema.properties) {
            option["properties"][key] = {
              type: typeof result[key],
              default: result[key],
              enum: [result[key]],
              readOnly: true
            };
            if (titleAccessor) {
              // Always true for now.
              option["properties"][titleAccessor] = {
                const: get(result, titleAccessor)
              };
            }
          }
        }
        // TODO: work with other types.
        else {
          option = result;
        }
        options.push(option);
      }
      // Sort options alphabetically.
      options = sortBy(
        options,
        option => option["properties"][titleAccessor].const
      );
      let newSchema = {
        ...this.props.schema,
        properties: {
          [titleAccessor]: {
            ...this.props.schema.properties[titleAccessor],
            enum: options.map(
              option => option["properties"][titleAccessor].const
            )
          }
        },
        dependencies: {
          [titleAccessor]: {
            oneOf: options
          }
        }
      };
      this.setState({
        loading: false,
        newSchema
      });
    } catch (e) {
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
      return <div style={{ color: "red" }}>{this.state.error}</div>;
    }
    let { "ui:field": field, ...uiSchema } = this.props.uiSchema;
    return (
      <div className="col-12">
        <label className="control-label">
          {this.props.uiSchema["ui:title"] || this.props.schema.title || ""}
        </label>
        <CustomForm
          schema={this.state.newSchema}
          tagName={"div"}
          uiSchema={uiSchema}
          formData={this.props.formData}
          className={"ccmt-cff-Page-SubFormPage-AutoPopulate"}
          onChange={e => this.props.onChange(e.formData)}
        >
          &nbsp;
        </CustomForm>
      </div>
    );
  }
}
export default AutoPopulateField;
