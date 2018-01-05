/// <reference path="./admin.d.ts"/>
import * as React from 'react';

class FormEdit extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            
        }
    }

    componentDidMount() {
        
    }
    render() {
        console.log(this.props.form);
        return (
            <div>
                <h1>Embed form shortcode</h1>
                <h2>{this.props.form.name}</h2>
                <pre>
                [ccmt-cff-render-form id="{this.props.form._id.$oid}"]
                </pre>
            </div>
        );
    }
}

export default FormEdit;