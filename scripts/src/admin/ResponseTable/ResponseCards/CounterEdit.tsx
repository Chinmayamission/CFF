import React from "react";
import { connect } from "react-redux";
import { editResponse } from "../../../store/responses/actions";
import { ResponsesState } from "../../../store/responses/types";
import "./ValueEdit.scss";

interface ICounterEditProps extends ResponsesState {
  editResponse: (a: string, b: string, c: any) => any;
}

interface ICounterEditState {
  counterValue: number | null;
}

class CounterEdit extends React.Component<
  ICounterEditProps,
  ICounterEditState
> {
  constructor(props: ICounterEditProps) {
    super(props);
    this.state = {
      counterValue:
        props.responseData && props.responseData.counter !== undefined
          ? props.responseData.counter
          : null
    };
  }

  componentDidUpdate(prevProps: ICounterEditProps) {
    const prevCounter =
      prevProps.responseData && prevProps.responseData.counter !== undefined
        ? prevProps.responseData.counter
        : null;
    const currentCounter =
      this.props.responseData && this.props.responseData.counter !== undefined
        ? this.props.responseData.counter
        : null;

    if (prevCounter !== currentCounter) {
      this.setState({ counterValue: currentCounter });
    }
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
    this.setState({ counterValue: value });
  };

  handleSave = () => {
    if (this.state.counterValue !== null) {
      this.props.editResponse(
        this.props.responseData._id.$oid,
        "counter",
        this.state.counterValue
      );
    }
  };

  render() {
    return (
      <div className="counter-edit-container" style={{ margin: "20px" }}>
        <h4>Edit Response Counter</h4>
        <div className="form-group row">
          <div className="col-sm-6">
            <input
              type="number"
              className="form-control"
              value={
                this.state.counterValue === null ? "" : this.state.counterValue
              }
              onChange={this.handleChange}
              placeholder="Counter value"
            />
          </div>
          <div className="col-sm-6">
            <button
              className="btn btn-primary"
              onClick={this.handleSave}
              disabled={this.state.counterValue === null}
            >
              Save Counter
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  ...state.responses
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  editResponse: (a, b, c) => dispatch(editResponse(a, b, c))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CounterEdit);
