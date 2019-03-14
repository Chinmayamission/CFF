import React from "react";
export class ConfirmWidget extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            valueOne: props.value,
            valueTwo: props.value,
            error: false
        }
    }
    onChangeOne(value) {
        this.setState({ valueOne: value }, this.onChangeIfMatch);
    }
    onChangeTwo(value) {
        this.setState({ valueTwo: value }, this.onChangeIfMatch);
    }
    onChangeIfMatch() {
        if (this.state.valueOne === this.state.valueTwo) {
            this.setState({ error: false });
            this.props.onChange(this.state.valueOne);
        }
        else if (this.state.valueTwo) {
            this.setState({ error: true });
            this.props.onChange(undefined);
        }
    }
    render() {
        const props = this.props;
        console.log(props);
        return (
            <div>
                <label>
                    <input type="text"
                        className="form-control"
                        value={this.state.valueOne}
                        required={props.required}
                        placeholder={props.placeholder}
                        onChange={(event) => this.onChangeOne(event.target.value)} />
                </label>
                <label>
                    <input type="text"
                        className="form-control"
                        value={this.state.valueTwo}
                        required={props.required}
                        placeholder={"Confirm " + props.label}
                        onChange={(event) => this.onChangeTwo(event.target.value)} />
                </label>
                {this.state.error && <label><ul
                    className="error-detail bs-callout bs-callout-info">
                    <li className="text-danger">Values must match.</li></ul>
                </label>}
            </div>
        );
    }
};