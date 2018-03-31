/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import FormPage from "../form/FormPage";
import { API } from 'aws-amplify';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class CenterList extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            centerList: null
        }
    }
    loadCenterList() {
        return API.get("CFF", "centers", {}).then(e => {
            this.setState({"centerList": e.res, "center": e.res[0]});
        }).catch(e => {
            // this.setState({status: STATUS_ACCESS_DENIED});
        });
    }
    componentDidMount() {
        this.loadCenterList();
    }
    render() {
        return (
            <div>
                Centers:
                <ul>
                    {this.state.centerList && this.state.centerList.map(e => 
                        <li key={e.id}><Link to={`/${e.name}/${e.id}`}>{e.name}</Link></li>
                    )}
                </ul>
            </div>
        )
    }
}
export default CenterList;

