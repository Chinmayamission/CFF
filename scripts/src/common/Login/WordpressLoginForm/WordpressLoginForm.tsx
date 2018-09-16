import React from "react";
import Login from "../Login";
import "./WordpressLoginForm.scss";
import { connect } from "react-redux";
import { setBootstrap } from "../../../store/base/actions";


const mapStateToProps = state => ({
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    setBootstrap: e => dispatch(setBootstrap(e))
});

class WordpressLoginForm extends React.Component<any, any> {
    componentDidMount() {
        this.props.setBootstrap(false);
    }
    render() {
        return <div className="ccmt-cff-wordpress-login-form">
            <Login />
        </div>;
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(WordpressLoginForm);