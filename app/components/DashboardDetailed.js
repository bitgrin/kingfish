// @flow
import { TransitionGroup, Transition } from 'react-transition-group';
import Anime from 'react-anime';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { Button, Glyphicon } from 'react-bootstrap';
import Switch from 'react-bootstrap-switch';
import Block from './Block';
import Logs from './Logs';
import bitgrin from '../utils/bitgrin';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sync } from 'realpath-native';
import open from 'open';
import { json } from 'graphlib';
import globals from '../globals';

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

type Props = {};

class DashboardDetailed extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {
        refreshing: false
    }
  }
  openURL(url) {
      open(url);
  }
  render() {
    // height, immature_balance, mature_balance
    let chain = this.props.chain;
    let local_height = chain.local_height;
    let seed_height = chain.seed_height;
    let summary = chain.wallet_summary;
    let outputs = chain.outputs;
    window.sum = summary;
    let mature_balance = bitgrin.to_xbg(summary.amount_currently_spendable);
    let immature_balance = bitgrin.to_xbg(summary.amount_awaiting_confirmation + summary.amount_immature);
    let refreshButtonClass = 'refreshBtn';
    if(this.state.refreshing) {
        refreshButtonClass = 'refreshBtnAnimate';
    }
    let friendly_mature_balance = 'Loading...';
    let friendly_immature_balance = '';

    if(!isNaN(mature_balance)) {
        friendly_mature_balance = `${mature_balance.toFixed(globals.XBG_PRECISION)} XBG`;
    }
    if(!isNaN(immature_balance)) {
        friendly_immature_balance = `${immature_balance.toFixed(globals.XBG_PRECISION)} XBG`;
    }
    
    let friendly_height = 'Chain not synchronized';
    if(typeof(local_height) != 'undefined') {
        friendly_height = local_height;
    }
    let balance_container_markup = (
        <div className='balanceContainerDetail'>
            <h4>Mature balance: {friendly_mature_balance}</h4>
            <h4>Pending balance: {friendly_immature_balance} pending</h4>
            <h4>Last height: {friendly_height}</h4><Glyphicon className={refreshButtonClass} glyph="refresh" />
            <hr />
        </div>
    )
    let txs = this.props.chain.wallet_txs;
    window.txs = txs;
    let outputsMarkup = (outputs || []).map((output) => {
        //{"commit":"09952e5782a0bcf9484600a63860e394ca12743719956ab46c1b56448b8d656276","output":{"commit":"09952e5782a0bcf9484600a63860e394ca12743719956ab46c1b56448b8d656276","height":"233146","is_coinbase":false,"key_id":"0300000000000000000000000000000000","lock_height":"0","mmr_index":null,"n_child":0,"root_key_id":"0200000000000000000000000000000000","status":"Unspent","tx_log_entry":0,"value":"200000000"}}
        return <div class="commitmentDetail">
            <i>Height:</i> {output.output.height}<br />
            <i>Commitment {output.commit}</i><br />
            <i>Coinbase:</i> { output.output.is_coinbase ? "Yes" : "No"}<br />
            <i>Status:</i> {output.output.status}<br />
            <i>Value:</i> {bitgrin.to_xbg(output.output.value)}<br />
            <a onClick={this.openURL.bind(this, `https://explorer.bitgrin.dev/block/${output.output.height}`)}>View in explorer &raquo;</a><br /><hr />
        </div>
    });

    /*let txMarkup = txs.map((tx) => {
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
    });*/
    return (
        <div className='container' data-tid="container">
            <div className='txsContainer'>
                <div>
                    <div className='balanceContainerOuterDetail'>
                        <div className='balanceContainerDetail'>
                            {balance_container_markup}
                            {outputsMarkup}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

}

function mapStateToProps(state) {
    return state;
}

export default connect(
    mapStateToProps,
    null
)(DashboardDetailed);