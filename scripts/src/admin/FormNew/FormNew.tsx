import * as React from 'react';
import { API } from 'aws-amplify';
import "./FormNew.scss";
import {IFormNewProps} from "./FormNew.d";

class FormNew extends React.Component<IFormNewProps, {}> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    createForm() {
      return API.post("CFF", 'forms', {"a":"b"
      }).then(e => {
        console.log(e.res);
        alert("Form created! Please refresh the page to see the form.");
      }).catch(e => this.props.onError(e));
    }
    componentDidMount() {
    }
    render() {
      return (<button className="btn btn-primary btn-sm"
        onClick={e => this.createForm()}>
        Create new form
      </button>);
    }
}
export default FormNew;