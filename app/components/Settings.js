// @flow
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import routes from '../constants/routes';
// import styles from './Settings.css';
import Switch from 'react-bootstrap-switch';
import {Button, FormGroup, FormControl, HelpBlock, ControlLabel} from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as SettingsActions from '../actions/settings';
import bitgrin from '../utils/bitgrin';

class Settings extends Component<Props> {
  constructor() {
    super();
    this.state = {
        returnToDash: false,
        walletCheckRunning: false,
        wallet_check_log: ''
    }
  }
  componentWillMount() {
    // Make sure the initial state matches what is in the wallet config file
    bitgrin.get_wallet_config((cfg) => {
        let wallet_exposed = cfg.wallet.api_listen_interface == "0.0.0.0";
        if(wallet_exposed) {
            this.props.setOutsideWorldPaymentsEnabled(true);
        }
        else {
            this.props.setOutsideWorldPaymentsEnabled(false);
        }
    })
  }
  toggleC31() {
      this.props.setC31Enabled(!this.props.c31Enabled)
  }
  setIdleTimeout(e) {
      const newTimeout = parseInt(e.target.value);
      if(isNaN(newTimeout)) {
          alert('Please enter a number')
          e.target.value = '';
          return;
      }
      this.props.setIdleTimeout(newTimeout)
  }
  idleMiningEnabled(t) {
    this.props.setIdleMiningEnabled(t.value());
  }
  outsideWorldPayments(t) {
    this.props.setOutsideWorldPaymentsEnabled(t.value());
  }
  save() {
      // Triggers when DONE is pressed
      bitgrin.write_toml_features(this.props);
      SettingsActions.save(() => {
          this.setState({...this.state, returnToDash: true})
      })
  }
  runWalletCheck() {
    this.setState({
        ...this.state,
        walletCheckRunning: true
    })
    bitgrin.run_wallet_check(() => {
        this.setState({
            ...this.state,
            walletCheckRunning: false,
            wallet_check_log: ''
        })
    }, (log) => {
        this.setState({
            ...this.state,
            wallet_check_log: `${log}\n${this.state.wallet_check_log}`
        })
    })
  }
  viewLogs() {
      this.setState({
          ...this.state,
          redirect_to_logs: true
      })
  }
  render() {
    let id = "id";
    if (this.state.returnToDash === true) {
        return <Redirect to='/' />
    }
    let futureFeaturesUI = (
        <div>
            <label>Mine when PC is idle</label>
            <Switch value={this.props.idleMiningEnabled} onChange={this.idleMiningEnabled.bind(this)} name='idleMiningEnabled' />
            <HelpBlock>Mine BitGrin if no activity is detected after a period of time</HelpBlock>
            <FormGroup controlId={id}>
                <ControlLabel>Idle Timeout</ControlLabel>
                <FormControl onChange={this.setIdleTimeout.bind(this)} type="text" label="Text" placeholder="5 Minutes" value={this.props.idleTimeout} />
                <HelpBlock>Number of minutes should Kingfish wait before automatically turning on mining</HelpBlock>
                <Button
                    bsStyle={this.props.c31Enabled ? 'primary' : 'danger'}
                    onClick={() => {this.toggleC31()}}>
                    {this.props.c31Enabled ? 'C31 Enabled' : 'C31 Disabled'}
                </Button>
                <HelpBlock>Enable the C31 BitGrin algorithm - only applies for GPUs with at least 11GB of memory</HelpBlock>
            </FormGroup>
        </div>
    )
    let walletCheckMarkup = (
        <div>
            <label>Run wallet check</label>
            <Button bsStyle="primary" onClick={this.runWalletCheck.bind(this)}>RUN WALLET CHECK &raquo;</Button>
            <HelpBlock>Wallets that have incomplete sends or other issues may need to be checked to correct balances.</HelpBlock>
        </div>
    )
    if(this.state.walletCheckRunning) {
        walletCheckMarkup = (
            <div>
                <label>Run wallet check</label>
                <Button bsStyle="primary" disabled onClick={this.runWalletCheck.bind(this)}>Checking wallet...</Button>
                <pre className="logOutputWalletCheck">{this.state.wallet_check_log}</pre>
            </div>
        )
    }
    futureFeaturesUI = ''; // Disable future features
    return (
        <div className='settingsContainer'>
            {this.state.redirect_to_logs ? <Redirect to="/logs" /> : ''}
            <label>Accept payments from the outside world</label>
            <Switch value={this.props.outsideWorldPayments} onChange={this.outsideWorldPayments.bind(this)} name='outsideWorldPayments' />
            <HelpBlock>Listens on 0.0.0.0:8515. Useful for receiving payments from others via HTTP.</HelpBlock>
            {walletCheckMarkup}
            {futureFeaturesUI}
            <Button bsStyle="primary" onClick={this.viewLogs.bind(this)}>VIEW LOGS</Button>
            <div className='saveContainer'>
                <Button bsStyle="success" onClick={this.save.bind(this)}>DONE</Button>
            </div>
        </div>
    );
  }
}

function mapStateToProps(state) {
    return state.settings;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(SettingsActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Settings);
  