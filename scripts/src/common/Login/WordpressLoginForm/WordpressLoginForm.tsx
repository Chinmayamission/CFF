import React from "react";
import Login from "../Login";
import "./WordpressLoginForm.scss";
import { connect } from "react-redux";
import { setBootstrap } from "../../../store/base/actions";
import { setAuthPage } from "../../../store/auth/actions";
import { IAuthState } from "../../../store/auth/types";


const mapStateToProps = state => ({
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setBootstrap: e => dispatch(setBootstrap(e)),
    setAuthPage: p => dispatch(setAuthPage(p))
});
interface WordpressLoginFormProps {
    authPage: string,
    setBootstrap: (e: boolean) => void,
    setAuthPage: (e: string) => void
}

class WordpressLoginForm extends React.Component<WordpressLoginFormProps, any> {
    componentDidMount() {
        this.props.setAuthPage(this.props.authPage);
        this.props.setBootstrap(false);
    }
    render() {
        return <div className="ccmt-cff-wordpress-login-form">
            <Login {...this.props} />
        </div>;
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(WordpressLoginForm);