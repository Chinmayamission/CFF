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
            let centerList = e.res;
            this.setState({ centerList });
            if (centerList.length && !this.props.selectedCenter) {
                this.props.history.push(`/${centerList[0].name}/${centerList[0].id}`);
            }
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
                        <a className={'nav-link' + (this.props.selectedForm ? "": " disabled ccmt-cff-nav-link-disabled")}
                            onClick={this.props.selectedForm ? this.props.history.goBack: null}
                            href="#">
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
                    {this.state.centerList && this.state.centerList.length == 0 && 
                        <div>No forms exist for this center yet.</div>
                    }
                </ul>
            </div>
        )
    }
}
export default CenterList;

