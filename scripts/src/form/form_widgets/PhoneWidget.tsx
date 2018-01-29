import * as React from "react";
let PhoneWidget = (props) => {
    const { id, value, required, onChange } = props;
    return (
        <input
            type="tel"
            className="form-control ccmt-cff-input-phone"
            title="Phone Number"
            id={id}
            value={value}
            required={required}
            pattern="([0-9]|-)+"
            onChange={(event) => onChange(event.target.value)}
        />
    );
};
export default PhoneWidget;