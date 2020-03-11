import * as React from "react";
import Modal from "react-responsive-modal";
import "./FormEmbed.scss";
import { IFormEmbedProps, IFormEmbedState } from "./FormEmbed.d";
import queryString from "query-string";

class FormEdit extends React.Component<IFormEmbedProps, IFormEmbedState> {
  constructor(props: any) {
    super(props);
    this.render = this.render.bind(this);
    this.state = {
      open: false
    };
  }
  onOpenModal = () => {
    this.setState({ open: true });
  };

  onCloseModal = () => {
    this.setState({ open: false });
  };

  componentDidMount() {}
  render() {
    return (
      <div>
        <h1>Embed form shortcode</h1>
        {/* <h2>{this.props.form.name}</h2> */}
        <pre>
          &lt;iframe frameborder="0" style="width: 100%; height: 100vh" src="
          {`${window.location.protocol}//${window.location.host}/v2/forms/${this.props.formId}`}
          "&gt; &lt;/iframe&gt;
        </pre>
        <button
          className="btn btn-primary"
          onClick={() => {
            this.onOpenModal();
          }}
        >
          Preview
        </button>
        <Modal
          open={this.state.open}
          onClose={this.onCloseModal}
          styles={{ modal: { width: "100%", height: "100%" } }}
        >
          <Embed formId={this.props.formId} />
          {/* todo: make default props, etc. toggle-able. */}
        </Modal>
      </div>
    );
  }
}

export function Embed(props: {
  formId: string;
  responseId?: string;
  mode?: string;
}) {
  let params: any = {};
  if (props.responseId) {
    params.responseId = props.responseId;
  }
  if (props.mode) {
    params.mode = props.mode;
  }
  const url = `${window.location.protocol}//${window.location.host}/v2/forms/${
    props.formId
  }?${queryString.stringify(params)}`;
  return (
    <iframe
      frameBorder="0"
      style={{ width: "100%", height: "100%" }}
      src={url}
    ></iframe>
  );
}

export default FormEdit;
