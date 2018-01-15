import * as React from 'react';
import SchemaField from "react-jsonschema-form";
import TitleField from "react-jsonschema-form";
import DescriptionField from "react-jsonschema-form";

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


function ArrayFieldTemplate(props) {
  return (
    <fieldset className={props.className}>
      <ArrayFieldTitle
        key={`array-field-title-${props.idSchema.$id}`}
        TitleField={props.TitleField}
        idSchema={props.idSchema}
        title={props.uiSchema["ui:title"] || props.title}
        required={props.required}
      />

      {(props.uiSchema["ui:description"] || props.schema.description) && (
        <div
          className="field-description"
          key={`field-description-${props.idSchema.$id}`}>
          {props.uiSchema["ui:description"] || props.schema.description}
        </div>
      )}

      <div
        className="row array-item-list"
        key={`array-item-list-${props.idSchema.$id}`}>
        {props.items.map((element, i) =>
          <div className="" key={i}>
            <div className="col-9">
              {element.children}
            </div>
            {element.hasRemove && i >= (props.schema.minItems || 0) &&
              <div className="col-3">
                  <button type="button" className="btn btn-danger col-12" onClick={element.onDropIndexClick}>Remove</button>
              </div>
            }
          </div>
        )}
      </div>

      {props.canAdd &&
        <div className="">
          <div className="col-3 offset-9">
            {<button type="button" className="btn btn-info col-12" onClick={props.onAddClick}>Add</button>}
          </div>
        </div>
      }
      </fieldset>
    
  );
}

export default ArrayFieldTemplate;