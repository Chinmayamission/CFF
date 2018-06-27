/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import FormEmbed from "./FormEmbed/FormEmbed";
import FormList from "./FormList/FormList";
import FormEdit from "./FormEdit/FormEdit";
import ResponseTable from "./ResponseTable/ResponseTable";
import ResponseSummary from "./ResponseSummary/ResponseSummary"
import FormShare from "./FormShare/FormShare"
import Loading from "src/common/Loading/Loading";
import "./admin.scss";
import "open-iconic/font/css/open-iconic-bootstrap.scss";
import { Route, Switch, Redirect } from "react-router-dom";
import {ConnectedRouter} from "connected-react-router";
import history from "src/history.ts";
import { connect } from 'react-redux';

import Login from "./Login";


declare var VERSION: string;
const STATUS_LOADING = 0;
const STATUS_ERROR = 11;
const STATUS_ACCESS_DENIED = 21;
const STATUS_CENTER_LIST = 31;

class FormAdminPage extends React.Component<IFormAdminPageProps, IFormAdminPageState> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            centerList: [],
            formList: [],
            center: null,
            selectedForm: null,
            status: STATUS_LOADING,
            hasError: false,
            user: {id: "", name: "", email: ""},
            apiKey: null,
            loading: false
        }
    }
    componentDidMount() {
        // this.loadCenters();
    }
    loadCenters() {
        this.setState({"status": STATUS_CENTER_LIST});
    }
    handleError(e) {
        console.error(e);
        this.setState({"hasError": true});
    }
    componentDidCatch(error, info) {
        // Display fallback UI
        console.error("ERROR", error);
        this.setState({ status: STATUS_ACCESS_DENIED, hasError: true });
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }
    onUnauth(error) {
        console.warn(error);
        this.setState({ status: STATUS_ACCESS_DENIED, hasError: true });
        // throw error;
    }
    onError(error) {
        this.onLoadEnd();
        this.setState({hasError: true});
        // if (error == "No credentials") {

        // }
        alert(error);
    }
    onLoadStart(e=null) {
        this.setState({"loading": true});
    }
    onLoadEnd(e=null) {
        this.setState({"loading": false});
    }
    render() {
        if (this.state.status == STATUS_ACCESS_DENIED) {
            return <AccessDenied userId={this.state.user.id} />;
        }
        if (this.state.hasError) {
            return <Loading hasError={true} />;
        }
        return (<ConnectedRouter history={history}>
            <div className="App FormAdminPage">
            <Route path="/admin/:formId" component={FormPages} />
            <Switch>
                <Route path="/admin/" exact render={props =>
                    <FormList onError={e => this.onError(e)} {...props} />
                }/>
            </Switch>
            </div>
        </ConnectedRouter>);
    }

}
function FormPages() {
    return (<Switch>
        <Route path='/admin/:formId/responses' exact render={({match, location}) =>
            <Redirect to={{pathname: `/admin/${match.params.centerSlug}/${match.params.centerId}/${match.params.formId}/responses/all` }} />} />
        <Route path='/admin/:formId/responsesEdit' exact render={({match, location}) =>
            <Redirect to={{pathname: `/admin/${match.params.centerSlug}/${match.params.centerId}/${match.params.formId}/responsesEdit/all` }} />} />
        <Route path="/admin/:formId/responses/:tableViewName" render={props =>
            <ResponseTable selectedForm={null} key={props.match.params.formId} editMode={false} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:formId/responsesEdit" render={props =>
            <ResponseTable selectedForm={null} key={props.match.params.formId} editMode={true} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:formId/embed" render={props =>
            <FormEmbed form={null} formId={props.match.params.formId} onError={e => this.onError(e)} />
        }/>
        <Route path="/admin/:formId/edit" render={props =>
            <FormEdit formId={props.match.params.formId} key={props.match.params.formId} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:formId/summary" render={props =>
            <ResponseSummary key={props.match.params.formId} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:formId/checkin" render={props =>
            <ResponseTable key={props.match.params.formId} checkinMode={true} editMode={false} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:formId/share" render={props =>
            <FormShare key={props.match.params.formId} onError={e => this.onError(e)} {...props} />
        }/>
    </Switch>);
}
function AccessDenied(props) {
    return (<div>
        <h4><b>Access denied</b></h4>
            <p>To finish setting up your account, please contact an administrator and give them your id:</p>
            <pre className="cff-copy-box">{props.userId}</pre>
    </div>);
}

interface IFormAdminPageWrapperProps {
    loggedIn: boolean
}


const mapStateToProps = state => ({
    ...state.auth
});
  
const mapDispatchToProps = (dispatch, ownProps) => ({

});
const FormAdminPageWrapper = (props:IFormAdminPageWrapperProps) => {
    return (<div>
        <div className="">
        <Login />
        </div>
        <hr />
    {props.loggedIn && <FormAdminPage />}
    </div>);
}

export default connect(mapStateToProps, mapDispatchToProps)(FormAdminPageWrapper);