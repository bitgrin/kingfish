// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
// import styles from './Logs.css';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as LogActions from '../actions/logs';
import {Form, Tabs, Tab, Button, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import fs from 'fs';
import bitgrin from '../utils/bitgrin';
// Tail = require('tail').Tail;
import TailLib from 'tail';
const Tail = TailLib.Tail;

class Logs extends Component<Props> {
    constructor() {
        super();
        this.state = {
            wallet_log_str: `Loading...`,
            server_log_str: `Loading...`
        }
    }
  componentDidMount() {
    let logComponent = this;
    this.server_tail = new Tail(bitgrin.get_server_log_path());
    this.server_tail.on("line", function(data) {
        console.log(data);
        logComponent.setState({
            ...logComponent.state,
            server_log_str: logComponent.state.server_log_str + '\n'  + data            
        });
    });
    this.componentWillUnmount() {
        this.server_tail.unwatch;
        this.wallet_tail.unwatch();
        this.server_tail = null;
        this.wallet_tail = null;
    }
    
    this.server_tail.on("error", function(error) {
        console.log('ERROR: ', error);
        logComponent.setState({
            ...logComponent.state,
            wallet_log_str: logComponent.state.wallet_log_str + '\n'  + error            
        });
    });

    this.wallet_tail = new Tail(bitgrin.get_wallet_log_path());
    this.wallet_tail.on("line", function(data) {
        console.log(data);
        logComponent.setState({
            ...logComponent.state,
            wallet_log_str: logComponent.state.wallet_log_str + '\n'  + data            
        });
    });
    
    this.wallet_tail.on("error", function(error) {
        console.log('ERROR: ', error);
        logComponent.setState({
            ...logComponent.state,
            wallet_log_str: logComponent.state.wallet_log_str + '\n'  + error            
        });
    });
    /*console.log(`#@ ${bitgrin.get_wallet_log_path()}`);
    console.log(`#@ ${bitgrin.get_server_log_path()}`);
    fs.readFile(bitgrin.get_wallet_log_path(), {encoding: 'utf8'}, (err, data) => {
        console.log(`#@ ${err}`);
        console.log(`#@ ${data}`);
    });
    try {
        this.wallet_log_str = fs.readFileSync(bitgrin.get_wallet_log_path(), {encoding: 'utf8'});
        this.server_log_str = fs.readFileSync(bitgrin.get_server_log_path(), {encoding: 'utf8'});
    }
    catch(e) {
        console.log(`#@ ${e}`);
    }*/
  }
  render() {
    // let serverlogcontent = this.props.server_log || "Server not running...";
    // let walletlogcontent = this.props.wallet_log || "Wallet not running...";
    let serverlogcontent = this.state.wallet_log_str || "Server not running...";
    let walletlogcontent = this.state.server_log_str || "Wallet not running...";
    return (
        <div>
            <h4 className='orange serv'>Server Log</h4>
            <h4 className='orange wall'>Wallet Log</h4>
            <textarea className='logs' onChange={() => {}} as="textarea" rows="23" value={serverlogcontent} />
            <textarea className='logs' onChange={() => {}} as="textarea" rows="23" value={walletlogcontent} />
            <Link to="/settings">
                <Button className='backButton' bsStyle="danger">BACK</Button>
            </Link>
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
)(Logs);
  