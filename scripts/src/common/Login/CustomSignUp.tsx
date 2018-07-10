/// <reference path="./aws-amplify-react.d.ts" />
import React, { Component } from 'react';

import { Auth, I18n } from 'aws-amplify';

import AuthPiece from 'aws-amplify-react/dist/auth/AuthPiece';
// import AmplifyTheme from '../AmplifyTheme';
import {
    FormSection,
    SectionHeader,
    SectionBody,
    SectionFooter,
    InputRow,
    FormRow,
    ButtonRow,
    Link
} from 'aws-amplify-react/dist/AmplifyUI';
import {SignUp} from "aws-amplify-react";

export default class CustomSignUp extends SignUp {
    render: any;
    setState: any;
    forceUpdate: any;
    props: any;
    inputs: any;
    state: any;
    context: any;
    refs: any;

    constructor(props) {
        super(props);

        this._validAuthStates = ['signUp'];
        this.signUp = this.signUp.bind(this);
    }

    signUp() {
        const { email, password, name, center } = this.inputs;
        const username = email;
        Auth.signUp({username, password,
                attributes: {"custom:center": center, name}
            })
            .then(() => this.changeState('confirmSignUp', username))
            .catch(err => this.error(err));
    }

    showComponent(theme) {
        const { hide } = this.props;
        if (hide && hide.includes(SignUp)) { return null; }

        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('Sign Up Account', 'Sign Up Account')}</SectionHeader>
                <SectionBody theme={theme}>
                    <InputRow
                        autoFocus
                        placeholder={I18n.get('Name', 'Name')}
                        theme={theme}
                        key="name"
                        name="name"
                        onChange={this.handleInputChange}
                    />
                    <InputRow
                        placeholder={I18n.get('Email', 'Email')}
                        theme={theme}
                        type="email"
                        key="email"
                        name="email"
                        onChange={this.handleInputChange}
                    />
                    <InputRow
                        placeholder={I18n.get('Password', 'Password')}
                        theme={theme}
                        type="password"
                        key="password"
                        name="password"
                        onChange={this.handleInputChange}
                    />
                    <FormRow>
                        <select className="amplify-input form-control form-control-sm" name="center" onChange={this.handleInputChange}>
                            <option value="" selected disabled>Select center</option>
                            <option value="ccmt">CCMT</option>
                            <option value="cmtc">CMTC</option>
                        </select>
                    </FormRow>
                    <ButtonRow onClick={this.signUp} theme={theme}>
                        {I18n.get('Sign Up', 'Sign Up')}
                    </ButtonRow>
                </SectionBody>
                <SectionFooter theme={theme}>
                    <div style={theme.col6}>
                        <Link theme={theme} onClick={() => this.changeState('confirmSignUp')}>
                            {I18n.get('Confirm a Code', 'Confirm a Code')}
                        </Link>
                    </div>
                    <div style={Object.assign({textAlign: 'right'}, theme.col6)}>
                        <Link theme={theme} onClick={() => this.changeState('signIn')}>
                            {I18n.get('Sign In', 'Sign In')}
                        </Link>
                    </div>
                </SectionFooter>
            </FormSection>
        )
    }
}