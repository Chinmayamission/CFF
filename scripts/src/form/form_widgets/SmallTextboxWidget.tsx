import React from "react";

// function SmallTextboxWidget(props) {
//   const {options, value} = props;
//   const {color, backgroundColor} = options;
//   return <input value={value} />
// }

// export default SmallTextboxWidget;

function BaseInput(props) {
  // Note: since React 15.2.0 we can't forward unknown element attributes, so we
  // exclude the "options" and "schema" ones here.
  if (!props.id) {
    console.log("No id for", props);
    throw new Error(`no id for props ${JSON.stringify(props)}`);
  }
  const {
    value,
    readonly,
    disabled,
    autofocus,
    onBlur,
    onFocus,
    options,
    schema,
    uiSchema,
    formContext,
    registry,
    ...inputProps
  } = props;

  inputProps.type = options.inputType || inputProps.type || "text";
  const _onChange = ({ target: { value } }) => {
    return props.onChange(value === "" ? options.emptyValue : value);
  };

  const { rawErrors, ...cleanProps } = inputProps;

  return (
    <input
      className=""
      readOnly={readonly}
      disabled={disabled}
      autoFocus={autofocus}
      value={value == null ? "" : value}
      {...cleanProps}
      onChange={_onChange}
      onBlur={onBlur && (event => onBlur(inputProps.id, event.target.value))}
      onFocus={onFocus && (event => onFocus(inputProps.id, event.target.value))}
    />
  );
}

// BaseInput.defaultProps = {
//   type: "text",
//   required: false,
//   disabled: false,
//   readonly: false,
//   autofocus: false,
// };

// if (process.env.NODE_ENV !== "production") {
//   BaseInput.propTypes = {
//     id: PropTypes.string.isRequired,
//     placeholder: PropTypes.string,
//     value: PropTypes.any,
//     required: PropTypes.bool,
//     disabled: PropTypes.bool,
//     readonly: PropTypes.bool,
//     autofocus: PropTypes.bool,
//     onChange: PropTypes.func,
//     onBlur: PropTypes.func,
//     onFocus: PropTypes.func,
//   };
// }

export default BaseInput;
