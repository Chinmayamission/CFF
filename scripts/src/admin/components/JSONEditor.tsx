/// <reference path="../admin.d.ts"/>
import * as React from 'react';
import * as jsoneditor from 'jsoneditor';
import "jsoneditor/dist/jsoneditor.min.css";

class JSONEditor extends React.Component<{data: any}, any> {
    private reference: HTMLDivElement;
    constructor(props: any) {
        super(props);
        this.state = {
            reference: null
        }
    }

    componentDidMount() {
        var options = {};
        var editor = new jsoneditor(this.reference, options);
        editor.set(this.props.data);
    }

    render() {
        return <div
            style={{ "flex": "1" }}
            ref={(e) => { this.reference = e; }} />
    }
}

export default JSONEditor;