// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Form, Tabs, Tab, Button, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import * as SettingsActions from '../actions/settings';
import bitgrin from '../utils/bitgrin';
const {clipboard} = require('electron');

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    return day + ' ' + monthNames[monthIndex] + ' ' + year + " - " + hours + ":" + minutes + ":" + seconds;
}
  

class TxHistory extends Component<Props> {
  copy(txt) {
    clipboard.writeText(txt);
  }
  render() {
    let txs = this.props.chain.wallet_txs;
    let txMarkup = txs.map((tx) => {
        let friendly_date = formatDate(new Date(Date.parse(tx.creation_ts)))
        let delta = bitgrin.to_xbg(tx.amount_credited - tx.amount_debited);
        let confirmedTxt = 'Unconfirmed';
        if(tx.confirmed) {
            confirmedTxt = "Confirmed";
        }
        let txSendLabel = tx.tx_type;
        if(tx.tx_type.includes("Sent")) {
            txSendLabel = "Sent";
        }
        else if(tx.tx_type.includes("Received")) {
            txSendLabel = "Received";
        }
        return (
            <div key={tx.tx_slate_id}>
                <h4>Transaction ID</h4>
                <h4 className='txidtext' onClick={() => {this.copy(tx.tx_slate_id)}}>{tx.tx_slate_id}</h4>
                <div>
                    <p>{txSendLabel} {delta} <span className='orange'>{confirmedTxt}</span><p className="small">{friendly_date}</p></p>
                </div>
                <br />
            </div>
        )
    });
    return (
        <div className='container' data-tid="container">
            <div id='topBar'>
                <div className='txsContainer'>
                    <h4 className='orange serv'>Transactions</h4>
                    <div>
                        <table>
                            <tbody>
                                {txMarkup}
                            </tbody>
                        </table>
                    </div>
                    <Link to="/">
                        <Button className='backButton' bsStyle="danger">BACK</Button>
                    </Link>
                </div>
            </div>
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
)(TxHistory);
  