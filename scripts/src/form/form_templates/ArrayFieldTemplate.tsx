import * as React from 'react';
import SchemaField from "react-jsonschema-form";
import TitleField from "react-jsonschema-form";
import DescriptionField from "react-jsonschema-form";
import "./ArrayFieldTemplate.scss";
import { FormattedDescriptionField } from '../CustomForm';

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
    }
  }
  render() {
    return (
      <fieldset className={this.props.className}>
        <ArrayFieldTitle
          key={`array-field-title-${this.props.idSchema.$id}`}
          TitleField={this.props.TitleField}
          idSchema={this.props.idSchema}
          title={this.props.uiSchema["ui:title"] || this.props.title}
          required={this.props.required}
        />

        {(this.props.uiSchema["ui:description"] || this.props.schema.description) && (
          <div
            className="field-description"
            key={`field-description-${this.props.idSchema.$id}`}>
            <FormattedDescriptionField id={`field-description-${this.props.idSchema.$id}`} description={this.props.uiSchema["ui:description"] || this.props.schema.description} />
          </div>
        )}

        <div
          className="array-item-list"
          key={`array-item-list-${this.props.idSchema.$id}`}>
          {this.props.items.map((element, i) =>
            <div className="row" key={i}>
              <div className="col-12">
                {/*<div className="ccmt-cff-array-row-number">{i + 1}.</div>*/}
                {this.props.uiSchema["ui:cff:arrayItemTitles"] && this.props.uiSchema["ui:cff:arrayItemTitles"][i] &&
                  <h2 className="ccmt-cff-form-title">
                    {this.props.uiSchema["ui:cff:arrayItemTitles"][i]}
                  </h2>
                }
                {element.children}
              </div>
              <div className="col-12 mt-4 mb-4 ccmt-cff-array-button-container">
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      {(element.hasRemove && i >= (this.props.schema.minItems || 0)) &&
                        <button type="button" className="btn btn-danger col-12 ccmt-cff-btn-array-remove" onClick={element.onDropIndexClick(element.index)}>{this.props.uiSchema["ui:cff:removeButtonText"] || "Remove"}</button>
                      }
                      {this.props.canAdd &&
                        <button type="button" className="btn btn-info col-12 ccmt-cff-btn-array-add" onClick={this.props.onAddClick}>{this.props.uiSchema["ui:cff:addButtonText"] || "Add"}</button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </fieldset>

    );
  }
}

export default ArrayFieldTemplate;