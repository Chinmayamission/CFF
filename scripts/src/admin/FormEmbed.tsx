/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import Modal from 'react-responsive-modal';
import FormPage from "src/form/FormPage";

class FormEdit extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            open: false
        }
    }
    onOpenModal = () => {
        this.setState({ open: true });
      };
     
      onCloseModal = () => {
        this.setState({ open: false });
      };

    componentDidMount() {

    }
    render() {
        console.log(this.props.form);
        
        return (
            <div>
                <h1>Embed form shortcode</h1>
                <h2>{this.props.form.name}</h2>
                <pre>
                [ccmt-cff-render-form id="{this.props.form.id}"]
                </pre>
                <button className="button button-primary" onClick={() => {this.onOpenModal()}}>Preview</button>
                <Modal open={this.state.open} onClose={this.onCloseModal}>
                    <FormPage formId = {this.props.form.id} apiEndpoint={this.props.apiEndpoint}/>
                </Modal>
            </div>
        );
    }
}

export default FormEdit;