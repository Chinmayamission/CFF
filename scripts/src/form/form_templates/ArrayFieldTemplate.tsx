import React from "react";
import "./ArrayFieldTemplate.scss";
import CustomForm, { FormattedDescriptionField } from "../CustomForm";
import classnames from "classnames";

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

function waitForCondition(conditionFn, interval = 100, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function checkCondition() {
      if (conditionFn()) {
        resolve();
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error("Condition not met within timeout period."));
      } else {
        setTimeout(checkCondition, interval);
      }
    }

    checkCondition();
  });
}

class ArrayFieldTemplate extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      initialNumItems: this.props.items ? this.props.items.length : 0
    };
  }
  async onNumItemsChange(e) {
    console.log(e);
    const newValue = parseInt(e);
    const oldValue = this.props.items ? this.props.items.length : 0;
    if (newValue > oldValue) {
      for (let i = oldValue + 1; i <= newValue; i++) {
        this.props.onAddClick({ preventDefault: () => null });
        await waitForCondition(() => this.props.items.length === i);
      }
    } else if (newValue < oldValue) {
      const disableModifExistingItems = this.props.uiSchema[
        "ui:cff:disableModifExistingItems"
      ];
      if (disableModifExistingItems) {
        // Don't allow removing items when disableModifExistingItems is true.
        return;
      }
      for (let i = oldValue - 1; i >= newValue; i--) {
        this.props.items[i].onDropIndexClick(i)();
      }
    }
    this.setState({ numItems: newValue });
  }
  renderNumItems() {
    const min = this.props.schema.minItems || 0;
    const max = this.props.schema.maxItems || 999;
    const range = Array.from(Array(max - min + 1).keys()).map(e => e + min);
    let enumDisabled = [];
    const disableModifExistingItems = this.props.uiSchema[
      "ui:cff:disableModifExistingItems"
    ];
    if (disableModifExistingItems) {
      // Don't allow removing items when disableModifExistingItems is true.
      enumDisabled = range.filter(i => i < this.state.initialNumItems);
    }
    return (
      <CustomForm
        tagName="div"
        schema={{
          title:
            this.props.schema["ui:cff:arrayNumItemsTitle"] ||
            this.props.uiSchema["ui:cff:arrayNumItemsTitle"] ||
            `Number of ${this.props.uiSchema["ui:title"] ||
              this.props.title ||
              "items"}`,
          type: "integer",
          enum: range,
          default: this.props.items ? this.props.items.length : 0,
          disabled: this.props.disabled,
          readOnly: this.props.readonly,
          "cff:radioDescription": this.props.schema["cff:radioDescription"]
        }}
        uiSchema={{
          "ui:widget": "cff:infoboxSelect",
          "ui:enumDisabled": enumDisabled,
          classNames: "ccmt-cff-array-numitems-select"
        }}
        onChange={({ formData }) => this.onNumItemsChange(formData)}
      >
        &nbsp;
      </CustomForm>
    );
  }
  render() {
    const disableModifExistingItems = this.props.uiSchema[
      "ui:cff:disableModifExistingItems"
    ];
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
              <div
                className={classnames("col-12 ccmt-cff-array-item-container", {
                  "ccmt-cff-Page-FormPage-readonly":
                    disableModifExistingItems && i < this.state.initialNumItems
                })}
              >
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
