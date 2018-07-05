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
        
        return (
            <div>
                <h1>Embed form shortcode</h1>
                {/* <h2>{this.props.form.name}</h2> */}
                <pre>
                    &lt;iframe frameborder="0" style="width: 100%; height: 100vh" src="{window.location.href}/v2/forms/{this.props.formId}"&gt;
                    &lt;/iframe&gt;
                </pre>
                <button className="btn btn-primary" onClick={() => {this.onOpenModal()}}>Preview</button>
                <Modal open={this.state.open} onClose={this.onCloseModal} styles={{"modal": {"width": "100%", "height": "100%"}}}>
                    <Embed formId={this.props.formId} />
                    {/* todo: make default props, etc. toggle-able. */}
                </Modal>
            </div>
        );
    }
}

function Embed(props) {
    return (<iframe frameBorder="0" style={{"width": "100%", "height": "100%"}} src={`${window.location.href}/v2/forms/${props.formId}`}>
    </iframe>);
}

export default FormEdit;