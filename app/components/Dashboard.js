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

type Props = {};

class Dashboard extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {
        refreshing: false
    }
  }
  render() {
    // height, immature_balance, mature_balance
    let chain = this.props.chain;
    let local_height = chain.local_height;
    let seed_height = chain.seed_height;
    let summary = chain.wallet_summary;
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
        friendly_mature_balance = `${mature_balance.toFixed(2)} XBG`;
    }
    if(!isNaN(immature_balance)) {
        friendly_immature_balance = `${immature_balance.toFixed(2)} XBG`;
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
            <h4>{friendly_immature_balance} pending</h4>
            <h5>{friendly_height}</h5><Glyphicon className={refreshButtonClass} glyph="refresh" />
        </div>
    )
    if(!synchronized) {
        balance_container_markup = (
        <div className='balanceContainerWrap'>
            <h2>{friendly_mature_balance}</h2>
            <h4>{friendly_immature_balance}</h4>
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
            <Link to="/txhistory" className="viewTxes">
                View transactions...
            </Link>
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