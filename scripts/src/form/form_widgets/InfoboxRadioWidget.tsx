import React from "react";
import { get } from "lodash";
import Infobox from "../components/Infobox";
// From RJSF -- todo: add a patch to RJSF which allows us to customize this, rather than using a custom widget

class RadioWidget extends React.Component<any, { open?: number }> {
    constructor(props) {
        super(props);
        this.state = {
            open: null
        }
    }

    render() {
        const {
            options,
            value,
            required,
            disabled,
            readonly,
            autofocus,
            onBlur,
            onFocus,
            onChange,
            id,
        } = this.props;
        // Generating a unique field name to identify this set of radio buttons
        const name = Math.random().toString();
        const { enumOptions, enumDisabled, inline } = options;
        // checked={checked} has been moved above name={name}, As mentioned in #349;
        // this is a temporary fix for radio button rendering bug in React, facebook/react#7630.
        return (
            <React.Fragment>
                {get(this.props.schema, ["cff:radioDescription"]) && <div style={{ display: "inline-block" }}>
                    <Infobox i={id + "-1"} description={get(this.props.schema, ["cff:radioDescription"])} />
                </div>}
                <div className="field-radio-group" id={id} style={{ position: "relative" }}>
                    {enumOptions.map((option, i) => {
                        const checked = option.value === value;
                        const itemDisabled =
                            enumDisabled && enumDisabled.indexOf(option.value) != -1;
                        const disabledCls =
                            disabled || itemDisabled || readonly ? "disabled" : "";
                        const radio = (
                            <span>
                                <input
                                    type="radio"
                                    checked={checked}
                                    name={name}
                                    required={required}
                                    value={option.value}
                                    disabled={disabled || itemDisabled || readonly}
                                    autoFocus={autofocus && i === 0}
                                    onChange={_ => onChange(option.value)}
                                    onBlur={onBlur && (event => onBlur(id, event.target.value))}
                                    onFocus={onFocus && (event => onFocus(id, event.target.value))}
                                />
                                <span>{option.label}</span>
                                {get(this.props.schema, ["cff:radioDescriptions", i]) &&
                                    <Infobox i={id + i} description={get(this.props.schema, ["cff:radioDescriptions", i])} />
                                }
                            </span>
                        );

                        return inline ? (
                            <label key={i} className={`radio-inline ${disabledCls}`}>
                                {radio}
                            </label>
                        ) : (
                                <div key={i} className={`radio ${disabledCls}`}>
                                    <label>{radio}</label>
                                </div>
                            );
                    })}
                </div>
            </React.Fragment>
        );
    }
}

export default RadioWidget;