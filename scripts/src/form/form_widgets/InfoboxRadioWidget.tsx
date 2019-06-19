import React from "react";
import * as DOMPurify from 'dompurify';
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap';

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
            <div className="field-radio-group" id={id}>
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
                            <img
                                width={15}
                                height={15}
                                src="https://www.freeiconspng.com/uploads/cute-ball-info-icon--i-like-buttons-3a-iconset--mazenl77-8.png"
                                onMouseOver={e => this.setState({ open: this.state.open === i ? null : i })}
                                onMouseLeave={e => this.state.open === i && this.setState({ open: null })}
                                id={"Popover" + i}
                                style={{"marginLeft": 10}}
                            />
                            <Popover placement="right" isOpen={this.state.open === i} target={"Popover" + i} toggle={e => this.setState({ open: this.state.open === i ? null : i })}>
                                {/* <PopoverHeader>Popover Title</PopoverHeader> */}
                                <PopoverBody>
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.props.schema["cff:radioDescription"] || "") }} />
                                </PopoverBody>
                            </Popover>
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
        );
    }
}

export default RadioWidget;