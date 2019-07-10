import React, { Ref, RefObject } from "react";
import MonacoEditor from "react-monaco-editor";
import Modal from "react-modal";

interface IJSONEditorProps {
  value: any;
  onChange: (any) => any;
  options?: {
    language?: string;
  };
}

const options = {
  selectOnLineNumbers: true,
  wordWrap: "on" as any
};

class JSONEditorWidget extends React.Component<IJSONEditorProps, any> {
  // private editorElement: any;
  private editor: any;
  private monaco: RefObject<MonacoEditor>;

  constructor(props: any) {
    super(props);
    this.monaco = React.createRef();
    this.state = {
      open: false
    };
  }

  onChange(value) {
    try {
      this.props.onChange(value);
    } catch (e) {
      // this.props.onJSONError(e);
    }
  }

  editorDidMount(monaco) {
    // this.monaco.current.editor.getAction('editor.action.formatDocument').run()
  }

  render() {
    return (
      <div>
        <Modal
          isOpen={this.state.open}
          onRequestClose={() => this.setState({ open: false })}
        >
          <span
            className="oi oi-circle-x"
            style={{ position: "absolute", top: 10, right: 10 }}
            onClick={() => this.setState({ open: false })}
          ></span>
          <MonacoEditor
            width="80vw"
            height="80vh"
            language={this.props.options.language || "html"}
            // theme="vs-dark"
            value={this.props.value}
            options={options}
            onChange={e => this.onChange(e)}
            ref={this.monaco}
            editorDidMount={e => this.editorDidMount(e)}
          />
        </Modal>
        <button
          className="btn btn-primary"
          onClick={() => this.setState({ open: true })}
        >
          Edit code
        </button>
      </div>
    );
  }
}

export default JSONEditorWidget;
