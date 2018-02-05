import * as React from "react";
import PropTypes from "prop-types";
import * as DOMPurify from 'dompurify';
import DescriptionField from "react-jsonschema-form";

function CheckboxWidget(props) {
  const {
    schema,id,value,
    required,disabled,readonly,
    label,autofocus,onChange
  } = props;
  return (
    <div className={`checkbox form-check ${disabled || readonly ? "disabled" : ""}`}>
        <input
          type="checkbox"
          id={id}
          className="form-check-input"
          checked={typeof value === "undefined" ? false : value}
          required={schema.required}
          disabled={disabled || readonly}
          autoFocus={autofocus}
          onChange={event => onChange(event.target.checked)}
        />
        <label htmlFor={id} className="form-check-label"
            dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(schema.description) }} />
    </div>
  );
}


export default CheckboxWidget;