// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as SettingsActions from '../actions/settings';
import {Form, Tabs, Tab, Button, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import bitgrin from '../utils/bitgrin';
const wallet = bitgrin.wallet_helper;

class AuthenticateWallet extends Component<Props> {
    constructor() {
        super();
        this.state = {
            msg: '',
            pass: '',
        };
    }
    setWalletPassword(e) {
        this.setState({
            ...this.state,
            pass: e.target.value
        });
    }
    err(msg) {
        this.setState({
            ...this.state,
            msg: msg
        });
    }
    save() {
        wallet.validate_seed_password(this.state.pass, (valid) => {
            if(valid) {
                this.props.setWalletPassword(wallet.encrypt_str(this.state.pass));
            }
            else {
                this.err("Password invalid")
            }
        })
    }
    render() {
        let validationMsg = '';
        if(this.state.msg != '') {
            validationMsg = (
                <div className='error'>{this.state.msg}</div>
            );
        }
        return (
            <div className='walletContainer'>
                <h4 className='orange'>Authenticate Wallet</h4>
                <p className="smallText">
                We've detected a previous BitGrin install on your computer. To give Kingfish permission to access this wallet, please enter
                your existing wallet's password.
                </p>
                <ControlLabel>Wallet Password</ControlLabel>
                <FormControl onChange={this.setWalletPassword.bind(this)} type="password" label="Text" /><br />
                <FormGroup>
                    <Button onClick={this.save.bind(this)} bsStyle="primary">AUTHENTICATE</Button>
                </FormGroup>
                {validationMsg}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(SettingsActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AuthenticateWallet);