/// <reference path="./CenterList.d.ts"/>
import * as React from 'react';
import axios from 'axios';
import { API } from 'aws-amplify';
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import "./CenterList.scss";

class CenterList extends React.Component<ICenterListProps, ICenterListState> {
    constructor(props: any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            centerList: null
        }
    }
    loadCenterList() {
        return API.post("CFF", "centers", {"body": this.props.user}).then(e => {
            this.setState({"centerList": e.res});
        }).catch(e => this.props.onError(e));
    }
    componentWillMount() {
        this.loadCenterList();
    }
    render() {
        return (
            <div>
                <ul className="nav nav-pills">
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={this.props.history.goBack}>
                            <span className="oi oi-media-skip-backward"></span>
                            &nbsp;&nbsp;Go back
                        </a>
                    </li>
                    {this.state.centerList && this.state.centerList.map(e => 
                        <li className="nav-item" key={e.id}>
                            <NavLink className="nav-link" to={`/${e.name}/${e.id}`}>
                                {e.name}
                            </NavLink>
                        </li>
                    )}
                </ul>
            </div>
        )
    }
}
export default CenterList;

