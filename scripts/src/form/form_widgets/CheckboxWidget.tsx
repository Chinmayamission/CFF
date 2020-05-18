import * as React from "react";
import sanitize from "../../sanitize";

function CheckboxWidget(props) {
  const {
    schema,
    id,
    value,
    required,
    disabled,
    readonly,
    label,
    autofocus,
    onChange
  } = props;
  return (
    <div>
      <label className="control-label">{schema.title}</label>
      <div
        className={`checkbox form-check ${
          disabled || readonly ? "disabled" : ""
        }`}
      >
        <input
          type="checkbox"
          id={id}
          className="form-check-input"
          checked={typeof value === "undefined" ? false : value}
          required={required}
          disabled={disabled || readonly}
          autoFocus={autofocus}
          onChange={event => onChange(event.target.checked)}
          style={{ bottom: 0 }}
        />
        <label
          htmlFor={id}
          className="form-check-label"
          dangerouslySetInnerHTML={{ __html: sanitize(schema.description) }}
        />
      </div>
    </div>
  );
}

export default CheckboxWidget;
