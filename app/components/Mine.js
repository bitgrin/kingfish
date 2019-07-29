// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as LogActions from '../actions/logs';
import {Form, Tabs, Tab, Button, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import bitgrin from '../utils/bitgrin';

class Mine extends Component<Props> {
    constructor() {
        super();
        this.state = {
            endpoint: `https://api.pool.bitgrin.dev/pool/payment/get_tx_slate/`,
            user_id_endpoint: `https://api.pool.bitgrin.dev/pool/users`,
            logs: ''
        };
    }
    setPoolEndpoint(e) {
        this.setState({
            ...this.state,
            endpoint: e.target.value
        })
    }
    setLogin(e) {
        this.setState({
            ...this.state,
            login: e.target.value
        })
    }
    setPassword(e) {
        this.setState({
            ...this.state,
            password: e.target.value
        })
    }
    performRequest() {
        if(this.state.login.length < 1 || this.state.password.length < 1 || this.state.endpoint.length < 1) {
            this.setState({
                ...this.state,
                logs: 'Please specify an endpoint, username, and password for the pool'
            })
            return;
        }

        bitgrin.pay.request_payment(this.state.login, this.state.password, this.state.user_id_endpoint, this.state.endpoint, (success, msg) => {
            if(success) {
                let logr = msg;
                if(msg == "ok" || msg == "\"ok\"") {
                    logr = "Payout processed successfully!";
                }
                this.setState({
                    ...this.state,
                    logs: logr
                })
            }
            else {
                console.log('fail!')
                this.setState({
                    ...this.state,
                    logs: msg
                })
            }
        });
    }
    render() {
        return (
        <div className='rContainer'>
                <p>Mining pool payouts can be requested here</p>
                
                {/* <ControlLabel>Payment Request Endpoint</ControlLabel>
                <FormControl onChange={this.setPoolEndpoint.bind(this)} type="text" label="Text" placeholder="https://api.pool.bitgrin.dev/pool/users"  defaultValue={this.state.user_id_endpoint} /> */}
                <br />
                <div className='left'>
                    <h4>Request from: <span className='orange'>pool.bitgrin.dev</span></h4>
                </div>
                <ControlLabel>Pool Login</ControlLabel>
                <FormControl onChange={this.setLogin.bind(this)} type="text" label="Text" placeholder="user@example.com" />
                <ControlLabel>Pool Password</ControlLabel>
                <FormControl onChange={this.setPassword.bind(this)} type="password" placeholder="******" label="Text" />
                <br/>
                <Button bsStyle="primary" onClick={this.performRequest.bind(this)}>REQUEST PAYMENT</Button>
                <br />
                {this.state.logs === "" ? '' : <pre>{this.state.logs}</pre>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state.logs;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(LogActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Mine);
  