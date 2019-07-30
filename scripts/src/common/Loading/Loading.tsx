import * as React from "react";
import "./Loading.scss";
import { css } from "@emotion/core";
import Modal from "react-responsive-modal";
import { ILoadingProps, ILoadingState } from "./Loading.d";
import FadeLoader from "react-spinners/FadeLoader";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

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
          <FadeLoader
            css={override}
            sizeUnit={"px"}
            size={150}
            color={"black"}
            loading={true}
          />
        </div>
      </div>
    );
  }
}

export default Loading;
