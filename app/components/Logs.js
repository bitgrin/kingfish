// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
// import styles from './Logs.css';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as LogActions from '../actions/logs';
import {Form, Tabs, Tab, Button, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';

class Logs extends Component<Props> {
  render() {
    let serverlogcontent = this.props.server_log || "Server not running...";
    let walletlogcontent = this.props.wallet_log || "Wallet not running...";
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
  