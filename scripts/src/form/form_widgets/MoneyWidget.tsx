import * as React from "react";
let MoneyWidget = (props) => {
    const { id, value, required, onChange } = props;
    return (
        <div className="input-group mb-3">
            <div className="input-group-prepend">
                <span className="input-group-text">$</span>
            </div>
            <input
                type="tel"
                className="form-control ccmt-cff-input-money"
                title="Amount"
                id={id}
                value={value}
                required={required}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
};
export default MoneyWidget;