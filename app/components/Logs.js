// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as LogActions from '../actions/logs';
import {Form, Tabs, Tab, Button, FormGroup, FormControl, Glyphicon, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import fs from 'fs';
import bitgrin from '../utils/bitgrin';
const { clipboard } = require('electron');

class Logs extends Component<Props> {
    copyLogs() {
        clipboard.writeText(`-- server log --\n${this.props.chain.server_log}\n-- wallet log --\n${this.props.chain.wallet_log}`);
    }
    render() {
    let serverlogcontent = this.props.chain.server_log || "Error retreiving wallet logs...";
    let walletlogcontent = this.props.chain.wallet_log || "Error retreiving server logs...";
    return (
        <div>
            <h4 className='orange serv'>Server Log</h4>
            <h4 className='orange wall'>Wallet Log</h4>
            <textarea className='logs' onChange={() => {}} as="textarea" rows="23" value={serverlogcontent} />
            <Glyphicon onClick={this.copyLogs.bind(this)} className='copyIPButton absCopy' glyph="copy"><span> Copy to clipboard</span></Glyphicon>
            <textarea className='logs' onChange={() => {}} as="textarea" rows="23" value={walletlogcontent} />
            <Link to="/settings">
                <Button className='backButton' bsStyle="danger">BACK</Button>
            </Link>
        </div>
    );
    }
}

function mapStateToProps(state) {
    return state;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(LogActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Logs);
  