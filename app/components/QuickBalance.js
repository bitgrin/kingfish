// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Form, Tabs, Tab, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import bitgrin from '../utils/bitgrin';

import { Button, Glyphicon } from 'react-bootstrap';
import globals from '../globals';

class QuickBalance extends Component<Props> {
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
        function numberWithCommas(x) {
            let n = parseInt(x);
            console.log(n);
            let iwc = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            const decimal_str = x.toString().split(".")[1];
            if(typeof(decimal_str) == 'undefined') {
                return iwc + ".0";
            }
            return iwc + "." + decimal_str;
        }
        const friendly_mature_balance_w_commas = numberWithCommas(5);
        let markup = (
            <div className='quickDashboardContainer'>
                <h2 className="balLab">Balance &nbsp;</h2>
                <h2>{friendly_mature_balance_w_commas} XBG</h2>
                {amount_immature_summary == `` ? `` : <h4>{amount_immature_summary}<i onClick={this.define.bind(this, 'immature')} className="tooltipIcon"></i></h4>}
                {awaiting_confirmation_summary == `` ? `` : <h4>{awaiting_confirmation_summary}<i onClick={this.define.bind(this, 'awaiting_confirmation')} className="tooltipIcon"></i></h4>}
                {amount_locked_summary == `` ? `` : <h4>{amount_locked_summary}<i onClick={this.define.bind(this, 'locked')} className="tooltipIcon"></i></h4>}
                {awaiting_finalization_summary == `` ? `` : <h4>{awaiting_finalization_summary}<i onClick={this.define.bind(this, 'awaiting_finalization')} className="tooltipIcon"></i></h4>}
                <h5>{friendly_height}</h5>
            </div>
        )
        return markup;
    }
}

function mapStateToProps(state) {
    return state;
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(QuickBalance);
  