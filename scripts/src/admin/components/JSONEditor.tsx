/// <reference path="../admin.d.ts"/>
import * as React from 'react';
import * as jsoneditor from 'jsoneditor';
import "jsoneditor/dist/jsoneditor.min.css";

class JSONEditor extends React.Component<{data: any, title: string}, any> {
    private reference: HTMLDivElement;
    constructor(props: any) {
        super(props);
        this.state = {
            reference: null
        }
    }

    componentDidMount() {
        var options = {
            "mode": "view"
            //"modes": ['tree', 'view', 'form', 'code', 'text']
            //"onEditable": d=>false
        };
        var editor = new jsoneditor(this.reference, options);
        editor.set(this.props.data);
    }

    render() {
        return (
            <div style={{ "flex": "1", "height": "auto" }}>
                <h2>{this.props.title}</h2>
                <div ref={(e) => { this.reference = e; }} />
            </div>);
    }
}

export default JSONEditor;