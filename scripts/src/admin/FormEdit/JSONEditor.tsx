/// <reference path="../admin.d.ts"/>
import * as React from 'react';
import * as jsoneditor from 'jsoneditor';
import "jsoneditor/dist/jsoneditor.min.css";

interface IJSONEditorProps {
    data: any,
    title: string,
    disabled: boolean,
    onChange?: (any) => any
}

class JSONEditor extends React.Component<IJSONEditorProps, any> {
    private editorElement: HTMLDivElement;
    private editor: any;
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }

    onChange() {
       if (this.props.disabled) {
           alert("This editor is disabled; its contents are read-only.");
           return;
       }
       this.props.onChange(this.editor.get());
    }

    componentDidMount() {
        var options = {
            "modes": this.props.disabled ? ["view"] : ["form", "code"],
            "onChange": () => this.onChange()
            //"modes": ['tree', 'view', 'form', 'code', 'text']
            //"onEditable": d=>false
        };
        this.editor = new jsoneditor(this.editorElement, options);
        this.editor.set(this.props.data);
    }

    render() {
        //this.editor && this.editor.set(this.props.data);
        return (
            <div className="col-12 col-sm-6 col-md-4" style={{ "float": "left", "height": "auto", "minWidth": 400 }}>
                <h2>{this.props.title}</h2>
                <div ref={(e) => { this.editorElement = e; }} />
            </div>);
    }
}

export default JSONEditor;