/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import axios from 'axios';

const STATUS_LOADING = 0;
const STATUS_FORM_LIST = 1;
const STATUS_FORM_RENDER = 2;
const STATUS_FORM_RESPONSES = 3;

class FormEdit extends React.Component<any, any> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            status: STATUS_LOADING
        }
    }

    componentDidMount() {
        
    }
    getPath(params) {

    }
    render() {
        return null;
    }
}

export default FormEdit;