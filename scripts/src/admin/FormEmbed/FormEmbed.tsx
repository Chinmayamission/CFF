/// <reference path="./FormEmbed.d.ts"/>
import * as React from 'react';
import Modal from 'react-responsive-modal';
import "./FormEmbed.scss";

class FormEdit extends React.Component<IFormEmbedProps, IFormEmbedState> {
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
                    &lt;iframe frameborder="0" style="width: 100%; height: 100vh" src="https://cff.chinmayamission.com/WP/forms/{this.props.form.id}"&gt;
                    &lt;/iframe&gt;
                </pre>
                <button className="btn btn-primary" onClick={() => {this.onOpenModal()}}>Preview</button>
                <Modal open={this.state.open} onClose={this.onCloseModal} styles={{"modal": {"width": "100%", "height": "100%"}}}>
                    {/* <FormPage formId = {this.props.form.id} apiEndpoint={this.props.apiEndpoint}
                        authKey="" specifiedShowFields={[""]} /> */}
                    <Embed form={this.props.form} />
                    {/* todo: make default props, etc. toggle-able. */}
                </Modal>
            </div>
        );
    }
}

function Embed(props) {
    return (<iframe frameBorder="0" style={{"width": "100%", "height": "100%"}} src={`/WP/forms/${props.form.id}`}>
    </iframe>);
}

export default FormEdit;