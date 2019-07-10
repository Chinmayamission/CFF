import * as React from "react";
import "./Loading.scss";
import Modal from "react-responsive-modal";
import { ILoadingProps, ILoadingState } from "./Loading.d";

class Loading extends React.Component<ILoadingProps, ILoadingState> {
  constructor(props: any) {
    super(props);
    this.state = {
      open: this.props.hasError
    };
  }
  close() {
    this.setState({ open: false });
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
  componentWillReceiveProps(newProps) {
    if (newProps.hasError != this.props.hasError) {
      this.setState({ open: newProps.hasError });
    }
  }
  render() {
    if (this.props.hasError === true) {
      return (
        <Modal open={this.state.open} onClose={() => this.close()}>
          <h5 className="card-title">Error</h5>
          <p className="card-text">
            Sorry, there was an error. You may not have the proper permissions
            to perform this action. Please try again later.
          </p>
        </Modal>
      );
    }
    return (
      <div className="ccmt-cff-loading-container">
        <div className="ccmt-cff-loading">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path
              opacity=".25"
              d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"
            ></path>
            <path
              d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"
              transform="rotate(152.678 16 16)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 16 16"
                to="360 16 16"
                dur="5.3s"
                repeatCount="indefinite"
              ></animateTransform>
            </path>
          </svg>
        </div>
      </div>
    );
  }
}

export default Loading;
