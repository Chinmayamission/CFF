/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import FormPage from "../form/FormPage";

class FormList extends React.Component<IFormListProps, IFormListState> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
        }
    }
    showEmbedCode(formId) {
        
    }
    render() {
        return (
        <table className="wp-list-table widefat fixed">
        <thead>
            <tr>
                <td>Form name</td>
                <td>Actions</td>
            </tr>
        </thead>
        <tbody>
            {this.props.formList.map((form) => 
                <tr key={form["_id"]["$oid"]} style = {{outline: 'thin solid'}}>
                    <td>{form["name"]}</td>
                    <td>
                        <button className="button button-primary" onClick = {() => this.showEmbedCode(form)}>Embed</button>

                        <button className="button">Edit</button>
                        <button className="button" onClick = {() => this.props.loadResponses(form)}>View Responses</button>
                    </td>
                </tr>
            )}
        </tbody>
        </table>
        )
    }
}
export default FormList;