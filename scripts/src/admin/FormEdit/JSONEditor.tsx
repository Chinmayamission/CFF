import React from 'react';
import jsoneditor from 'jsoneditor';
import "jsoneditor/dist/jsoneditor.min.css";

interface IJSONEditorProps {
    data: any,
    disabled?: boolean,
    onChange?: (any) => any,
    large?: boolean
}

class JSONEditor extends React.Component<IJSONEditorProps, any> {
    private editorElement: HTMLDivElement;
    private editor: any;
    constructor(props: any) {
        super(props);
        this.state = {
          data: props.data
        }
    }

    onChange() {
       if (this.props.disabled === true) {
           alert("This editor is disabled; its contents are read-only.");
           return;
       }
       try {
        this.props.onChange(this.editor.get());
       }
       catch (e) {
           console.error(e);
       }
    }

    componentDidMount() {
        var options = {
            "modes": this.props.disabled ? ["view"] : ["code", "form", "tree"],
            "onChange": () => this.onChange()
            //"modes": ['tree', 'view', 'form', 'code', 'text']
            //"onEditable": d=>false
        };
        this.editor = new jsoneditor(this.editorElement, options);
        this.editor.set(this.props.data || {});
    }

    render() {
      // console.log('hello')
        // console.log(this.props.data)
        //this.editor && this.editor.set(this.props.data);
        // <div></div>
        return (
            <div className={"col-12"} style={{"height": "100%"}}>
                <div style={{"height":"100%"}} ref={(e) => { this.editorElement = e; }} />
            </div>);
    }
}

export default JSONEditor;
