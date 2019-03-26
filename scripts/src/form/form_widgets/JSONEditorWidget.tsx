import React, { Ref, RefObject } from 'react';
import MonacoEditor from 'react-monaco-editor';

interface IJSONEditorProps {
    value: any,
    onChange: (any) => any,
    options?: {
        language?: string
    }
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
        }
    }

    componentDidMount() {
        console.log(this.monaco.current.editor, this.monaco.current.editor.getAction('editor.action.formatDocument'));
        // this.monaco.current.editor.getAction('editor.action.formatDocument').run();
        // this.monaco.current.editor.getAction('editor.action.format').run();
    }

    editorWillMount(monaco) {
        // monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        //     allowComments: false,
        //     validate: true
        // });
    }

    onChange(value) {
        try {
            this.props.onChange(value);
        }
        catch (e) {
            // this.props.onJSONError(e);
        }
        
    }
    
    editorDidMount(monaco) {
        setTimeout(() => this.monaco.current.editor.getAction('editor.action.formatDocument').run(), 100);
    }

    render() {
        return (
          <MonacoEditor
            width="100%"
            height="300"
            language={this.props.options.language || "html"}
            // theme="vs-dark" 
            value={this.props.value}
            options={options}
            onChange={e => this.onChange(e)}
            ref={this.monaco}
            editorDidMount={e => this.editorDidMount(e)}
          />
        );
      }

   
}

export default JSONEditorWidget;
