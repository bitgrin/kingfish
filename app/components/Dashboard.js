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
import globals from '../globals';
import open from 'open';

type Props = {};

class Dashboard extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {
        refreshing: false
    }
  }
  define(keyword) {
      // Perform a definition lookup on the bitgrin wiki for a term
      open(`https://bitgrin.dev/define/${keyword}`)
  }
  render() {
    // height, immature_balance, mature_balance
    let chain = this.props.chain;
    let local_height = chain.local_height;
    let seed_height = chain.seed_height;
    let summary = chain.wallet_summary;
    window.sum = summary;
    let mature_balance = bitgrin.to_xbg(summary.amount_currently_spendable);
    
    /*
    let immature_balance = bitgrin.to_xbg(parseInt(summary.amount_awaiting_confirmation) + parseInt(summary.amount_immature));
    */
    
    let amount_awaiting_confirmation = bitgrin.to_xbg(parseInt(summary.amount_awaiting_confirmation));
    let amount_immature = bitgrin.to_xbg(parseInt(summary.amount_immature));
    let awaiting_confirmation_summary = ``;
    let amount_immature_summary = ``;

    if(amount_awaiting_confirmation > 0.0) {
        awaiting_confirmation_summary = `${amount_awaiting_confirmation.toFixed(globals.XBG_PRECISION)} XBG awaiting confirmation`;
    }
    if(amount_immature > 0.0) {
        amount_immature_summary = `${amount_immature.toFixed(globals.XBG_PRECISION)} XBG immature`;
    }

    let awaiting_finalization = bitgrin.to_xbg(parseInt(summary.amount_awaiting_finalization));
    let amount_locked = bitgrin.to_xbg(parseInt(summary.amount_locked));
    let amount_locked_summary = ``;
    let awaiting_finalization_summary = ``;

    if(amount_locked > 0.0) {
        amount_locked_summary += `${amount_locked.toFixed(globals.XBG_PRECISION)} XBG locked`;
    }
    if(awaiting_finalization > 0.0) {
        awaiting_finalization_summary = `${awaiting_finalization.toFixed(globals.XBG_PRECISION)} XBG awaiting finalization`;
    }

    let refreshButtonClass = 'refreshBtn';
    if(this.state.refreshing) {
        refreshButtonClass = 'refreshBtnAnimate';
    }
    let friendly_mature_balance = 'Loading...';

    if(!isNaN(mature_balance)) {
        friendly_mature_balance = `${mature_balance.toFixed(globals.XBG_PRECISION)} XBG`;
    }
    
    let synchronized = false;
    let friendly_height = 'Chain not synchronized';
    if(typeof(local_height) != 'undefined') {
        if(local_height == seed_height) {
            friendly_height = `Fully synced  -  Height: ${local_height}`;
            synchronized = true;
        }
        else {
            let per_synced = Math.floor((local_height / seed_height) * 100);
            if(per_synced == 'Infinity') {
                // Seed height erroring here on Mac OS. Temporary work-around.
                friendly_height = `Fully synced  -  Height: ${local_height}`;
                synchronized = true;
            }
            else {
                friendly_height = `${per_synced}% - Block ${local_height} / ${seed_height}`;
            }
        }
    }
    let balance_container_markup = (
        <div className='balanceContainerWrap'>
            <h2>{friendly_mature_balance}</h2>
            {amount_immature_summary == `` ? `` : <h4>{amount_immature_summary}<i onClick={this.define.bind(this, 'immature')} className="tooltipIcon"></i></h4>}
            {awaiting_confirmation_summary == `` ? `` : <h4>{awaiting_confirmation_summary}<i onClick={this.define.bind(this, 'awaiting_confirmation')} className="tooltipIcon"></i></h4>}
            {amount_locked_summary == `` ? `` : <h4>{amount_locked_summary}<i onClick={this.define.bind(this, 'locked')} className="tooltipIcon"></i></h4>}
            {awaiting_finalization_summary == `` ? `` : <h4>{awaiting_finalization_summary}<i onClick={this.define.bind(this, 'awaiting_finalization')} className="tooltipIcon"></i></h4>}
            <h5>{friendly_height}</h5><Glyphicon className={refreshButtonClass} glyph="refresh" />
            <h5><Link to="/txhistory" className="viewTxes">
                View transactions &raquo;
            </Link></h5>
        </div>
    )
    if(!synchronized) {
        balance_container_markup = (
        <div className='balanceContainerWrap'>
            <h2>{friendly_mature_balance}</h2>
            <h4>Synchronizing...</h4>
            <h5>{friendly_height}</h5><Glyphicon className={refreshButtonClass} glyph="refresh" />
        </div>
        )
    }
    if(!synchronized && local_height==0) {
        balance_container_markup = (
        <div className='balanceContainerWrap'>
            <br />
            <h4>Synchronizing...</h4>
            <h4>{bitgrin.sync.state()}</h4>

        </div>
        )
    }
    return (
        <div className='container' data-tid="container">
            <div>
                <div className='balanceContainerOuter'>
                    <div className='balanceContainer'>
                        {balance_container_markup}
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
)(Dashboard);