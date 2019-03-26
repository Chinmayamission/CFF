import React, { Ref, RefObject } from 'react';
import MonacoEditor from 'react-monaco-editor';


interface IJSONEditorProps {
    data: any,
    disabled?: boolean,
    onChange?: (any) => any,
    large?: boolean,
    changeFromEditor: boolean,
    onJSONError: (x: string) => void
}

const options = {
    selectOnLineNumbers: true,
    wordWrap: "on" as any
};

class JSONEditor extends React.Component<IJSONEditorProps, any> {
    // private editorElement: any;
    private editor: any;
    private monaco: RefObject<MonacoEditor>;

    constructor(props: any) {
        super(props);
        this.monaco = React.createRef();
        this.state = {
            value: JSON.stringify(this.props.data, null, 2)
        }
    }

    componentDidMount() {
    }

    editorWillMount(monaco) {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            allowComments: false,
            validate: true
        });
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.changeFromEditor) {
            return false;
        }
        if (JSON.stringify(nextProps.data) == JSON.stringify(this.props.data)) {
            return false;
        }
        return true;
    }

    onChange(value) {
        // console.log(this.monaco.current.editor); //({}));
        try {
            this.props.onChange(JSON.parse(value));
        }
        catch (e) {
            this.props.onJSONError(e);
        }
        
    }

    editorDidMount(monaco) {
        console.log(monaco);
    }

    render() {
        return (
          <MonacoEditor
            width="100%"
            height="100%"
            language="json"
            // theme="vs-dark" 
            value={this.state.value}
            options={options}
            onChange={e => this.onChange(e)}
            // editorDidMount={this.editorDidMount}
            ref={this.monaco}
            editorWillMount={this.editorWillMount}
          />
        );
      }

   
}

export default JSONEditor;
