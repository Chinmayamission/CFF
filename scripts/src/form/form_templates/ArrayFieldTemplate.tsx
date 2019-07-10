import * as React from "react";
import SchemaField from "react-jsonschema-form";
import TitleField from "react-jsonschema-form";
import SelectWidget from "react-jsonschema-form";
import "./ArrayFieldTemplate.scss";
import { FormattedDescriptionField } from "../CustomForm";

function ArrayFieldTitle({ TitleField, idSchema, title, required }) {
  if (!title) {
    // See #312: Ensure compatibility with old versions of React.
    return <div />;
  }
  const id = `${idSchema.$id}__title`;
  return <TitleField id={id} title={title} required={required} />;
}

function ArrayFieldDescription({ DescriptionField, idSchema, description }) {
  if (!description) {
    // See #312: Ensure compatibility with old versions of React.
    return <div />;
  }
  const id = `${idSchema.$id}__description`;
  return <DescriptionField id={id} description={description} />;
}

class ArrayFieldTemplate extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      numItems: 0
    };
  }
  onNumItemsChange(e) {
    const newValue = parseInt(e);
    const oldValue = this.props.items ? this.props.items.length : 0;
    if (newValue > oldValue) {
      for (let i = oldValue + 1; i <= newValue; i++) {
        this.props.onAddClick({ preventDefault: () => null });
      }
    } else if (newValue < oldValue) {
      for (let i = oldValue - 1; i >= newValue; i--) {
        this.props.items[i].onDropIndexClick(i)();
      }
    }
  }
  renderNumItems() {
    const min = this.props.schema.minItems || 0;
    const max = this.props.schema.maxItems || 999;
    const range = Array.from(Array(max - min + 1).keys()).map(e => e + min);
    return (
      <SelectWidget
        schema={{
          title:
            this.props.schema["ui:cff:arrayNumItemsTitle"] ||
            this.props.uiSchema["ui:cff:arrayNumItemsTitle"] ||
            `Number of ${this.props.uiSchema["ui:title"] ||
              this.props.title ||
              "items"}`,
          type: "integer",
          enum: range,
          default: this.props.items ? this.props.items.length : 0
        }}
        className="form-control ccmt-cff-array-numitems-select"
        disabled={this.props.disabled}
        readonly={this.props.readonly}
        onChange={({ formData }) => this.onNumItemsChange(formData)}
      >
        &nbsp;
      </SelectWidget>
    );
  }
  render() {
    return (
      <fieldset className={this.props.className}>
        {this.props.uiSchema["ui:cff:showArrayNumItems"] === true && (
          <div className="col-12 col-sm-6 p-0">{this.renderNumItems()}</div>
        )}
        <ArrayFieldTitle
          key={`array-field-title-${this.props.idSchema.$id}`}
          TitleField={this.props.TitleField}
          idSchema={this.props.idSchema}
          title={this.props.uiSchema["ui:title"] || this.props.title}
          required={this.props.required}
        />

        {(this.props.uiSchema["ui:description"] ||
          this.props.schema.description) && (
          <div
            className="field-description"
            key={`field-description-${this.props.idSchema.$id}`}
          >
            <FormattedDescriptionField
              id={`field-description-${this.props.idSchema.$id}`}
              description={
                this.props.uiSchema["ui:description"] ||
                this.props.schema.description
              }
            />
          </div>
        )}

        <div
          className="array-item-list"
          key={`array-item-list-${this.props.idSchema.$id}`}
        >
          {this.props.items.map((element, i) => (
            <div className="row" key={i}>
              <div className="col-12 ccmt-cff-array-item-container">
                {/*<div className="ccmt-cff-array-row-number">{i + 1}.</div>*/}
                {this.props.uiSchema["ui:cff:arrayItemTitles"] &&
                  this.props.uiSchema["ui:cff:arrayItemTitles"][i] && (
                    <h2 className="ccmt-cff-form-title">
                      {this.props.uiSchema["ui:cff:arrayItemTitles"][i]}
                    </h2>
                  )}
                {element.hasRemove &&
                  i >= (this.props.schema.minItems || 0) && (
                    <span
                      className="oi oi-circle-x ccmt-cff-array-close-button"
                      onClick={() =>
                        confirm(
                          this.props.uiSchema["ui:cff:removeButtonText"]
                            ? `Are you sure you want to ${this.props.uiSchema["ui:cff:removeButtonText"]}?`
                            : "Are you sure you want to remove this item?"
                        ) && element.onDropIndexClick(element.index)()
                      }
                    ></span>
                  )}
                {element.children}
              </div>
            </div>
          ))}
          {this.props.canAdd &&
            this.props.uiSchema["ui:cff:showAddButton"] !== false && (
              <button
                type="button"
                className="btn btn-info col-12 mt-4 ccmt-cff-btn-array-add"
                onClick={this.props.onAddClick}
              >
                <small>
                  <span className="oi oi-plus"></span>
                </small>
                &nbsp;&nbsp;&nbsp;
                {this.props.uiSchema["ui:cff:addButtonText"] || "Add"}
              </button>
            )}
        </div>
      </fieldset>
    );
  }
}

export default ArrayFieldTemplate;
