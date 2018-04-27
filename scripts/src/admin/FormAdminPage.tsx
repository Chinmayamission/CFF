/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import {flatten} from 'flat';
import * as queryString from "query-string";
import {pick, get, set, find} from "lodash-es";
import FormPage from "../form/FormPage";
import FormEmbed from "./FormEmbed";
import CenterList from "./CenterList/CenterList";
import FormList from "./FormList/FormList";
import FormEdit from "./FormEdit/FormEdit";
import ResponseTable from "./ResponseTable/ResponseTable";
import ResponseSummary from "./ResponseSummary/ResponseSummary"
import FormShare from "./FormShare/FormShare"
import Loading from "src/common/Loading/Loading";
import "./admin.scss";
import "open-iconic/font/css/open-iconic-bootstrap.scss";
import { withAuthenticator } from 'aws-amplify-react';
import { Auth, API } from 'aws-amplify';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

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
    componentWillReceiveProps(nextProps) {
        console.log(nextProps, nextProps.authState);
        if (this.props.authState != "signedIn" && nextProps.authState == "signedIn") {

        }
    }
    componentWillMount() {
        Auth.currentCredentials().then(creds => {
            if (!creds || creds.expired) {
                Auth.signOut();
                return;
            }
            Auth.currentUserInfo().then(e => {
                console.warn(creds, e);
                if (!e) {
                    Auth.signOut();
                    return;
                }
                let currentUser = pick(e, ["id", "name", "email"]);
                if (!currentUser.id) {
                    currentUser.id = creds.params.IdentityId;
                }
                currentUser.id = "cff:cognitoIdentityId:" + currentUser.id;
                this.setState({user: currentUser}); // , this.loadCenters);
                console.log(currentUser);
            });
        });
    }
    componentDidMount() {
        this.loadCenters();
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
        return (<Router>
            <div className="App FormAdminPage">
            {this.state.user.id &&
                <Switch>
                    <Route path="/admin/" exact render={(props) =>
                        <CenterList {...props} user={this.state.user} onError={e => this.onUnauth(e)} />
                    }/>
                    <Route path="/admin/:centerSlug/:centerId" exact render={(props) =>
                        <CenterList {...props} selectedCenter={true} user={this.state.user} onError={e => this.onUnauth(e)} />
                    }/>
                    <Route path="/admin/" render={(props) =>
                        <CenterList {...props} selectedCenter={true} selectedForm={true} user={this.state.user} onError={e => this.onUnauth(e)} />
                    }/>
                </Switch>
            }
            <Route path="/admin/:centerSlug/:centerId" exact render={props =>
                <FormList key={props.match.params.centerSlug} onError={e => this.onError(e)} userId={this.state.user.id} {...props} />
            }/>
            <Route path="/admin/:centerSlug/:centerId/:formId" component={FormPages} />
            <footer className="ccmt-cff-admin-footer">
                <div className="container">
                    <span className="text-muted">Chinmaya Forms Framework, version {VERSION}</span>
                </div>
            </footer>
            </div>
        </Router>);

        }
}
function FormPages() {
    return (<Switch>
        <Route path='/admin/:centerSlug/:centerId/:formId/responses' exact render={({match}) => <Redirect to={`/admin/${match.params.centerSlug}/${match.params.centerId}/${match.params.formId}/responses/all`} />} />
        <Route path='/admin/:centerSlug/:centerId/:formId/responsesEdit' exact render={({match}) => <Redirect to={`/admin/${match.params.centerSlug}/${match.params.centerId}/${match.params.formId}/responsesEdit/all`} />} />
        <Route path="/admin/:centerSlug/:centerId/:formId/responses/:tableViewName" render={props =>
            <ResponseTable key={props.match.params.formId} editMode={false} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:centerSlug/:centerId/:formId/responsesEdit" render={props =>
            <ResponseTable key={props.match.params.formId} editMode={true} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:centerSlug/:centerId/:formId/edit" render={props =>
            <FormEdit key={props.match.params.formId} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:centerSlug/:centerId/:formId/summary" render={props =>
            <ResponseSummary key={props.match.params.formId} onError={e => this.onError(e)} {...props} />
        }/>
        <Route path="/admin/:centerSlug/:centerId/:formId/share" render={props =>
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

export default withAuthenticator(FormAdminPage, { includeGreetings: true });