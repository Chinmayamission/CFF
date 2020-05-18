import * as React from "react";
import { get } from "lodash";

class SameAsField extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      checked: false
    };
  }
  onCheck() {
    if (!this.state.checked) {
      const formData = this.props.formContext.formData;
      const value = get(
        formData,
        this.props.uiSchema["ui:options"]["cff:sameAsFieldPath"]
      );
      this.props.onChange(value);
    }
    this.setState({ checked: !this.state.checked });
  }
  onEdit(a, b) {
    if (this.state.checked) {
      this.onCheck();
    }
    this.props.onChange(a, b);
  }
  render() {
    const id = this.props.idSchema.$id + "-cff-sameAsCheckbox";
    let props = { ...this.props };
    props.onChange = (a, b) => this.onEdit(a, b);
    const name =
      this.props.uiSchema["ui:options"]["cff:sameAsFieldName"] ||
      this.props.uiSchema["ui:options"]["cff:sameAsFieldPath"];
    return (
      <div>
        <this.props.registry.fields.ObjectField {...props} />
        <div className="ccmt-cff-sameAs">
          <input
            type="checkbox"
            id={id}
            onChange={e => this.onCheck()}
            checked={this.state.checked}
          />
          <label htmlFor={id}>Same as {name}</label>
        </div>
      </div>
    );
  }
}
export default SameAsField;
