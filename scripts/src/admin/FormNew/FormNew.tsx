/// <reference path="./FormNew.d.ts"/>
import * as React from 'react';
import { API } from 'aws-amplify';
import "./FormNew.scss";
import {find, pick, get} from "lodash-es";

class FormNew extends React.Component<IFormNewProps, {}> {
    constructor(props: any) {
        super(props);
        this.state = {
        }
    }
    createForm() {
      return API.post("CFF_v2", 'forms', {"a":"b"
      }).then(e => {
        console.log(e.res);
        alert("DONE!" + e.res);
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