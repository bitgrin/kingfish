// @flow
import React, { Component } from 'react';
import routes from '../constants/routes';
import styles from './Home.scss';
import bs from './bootstrap/css/bootstrap.min.css';
import Dashboard from './Dashboard';
import Send from './Send';
import Receive from './Receive';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import { Link, Redirect } from 'react-router-dom';
import { Button, Glyphicon } from 'react-bootstrap';
const remote = require('electron').remote;
import receiveHelper from '../utils/bitgrin/receiveHelper';
import { connect } from 'react-redux';
import bitgrin from '../utils/bitgrin';

type Props = {};

class WalletEncrypted extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {
      freeze_input: false,
      confirmingWalletReset: false,
      err_logs: ""
    }
  }
  open_wallet() {
    this.setState({...this.state, 
      freeze_input: true
    });
    bitgrin.wallet_helper.set_pass(this.pass, (success, err_logs) => {
      if(success) {
        // Log in
        this.setState({...this.state, 
          password_valid: true
        });
      }
      else {
        this.setState({...this.state, 
          password_valid: false,
          freeze_input: false,
          err_logs: err_logs
        });
      }
    });
  }
  resetWallet() {
    this.setState({
      ...this.state,
      confirmingWalletReset: true
    })
  }
  confirmResetWallet() {
    bitgrin.wallet_implode((success, error_msg) => {
      if(!success) {
        alert(error_msg);
      }
      else {
        // Success
        alert("Wallet reset. Please restart Kingfish to continue.");
      }
      this.setState({
        ...this.state,
        freeze_input: false,
        confirmingWalletReset: false
      })
    })
  }
  cancelResetWallet() {
    this.setState({
      ...this.state,
      confirmingWalletReset: false
    })
  }
  set_pass(e) {
    this.pass = e.target.value;
  }
  _handleKeyDown(e) {
    if (e.key === 'Enter') {
      this.open_wallet();
    }
  }
  render() {
    let validation_markup = "";
    if(typeof(this.state.password_valid) != 'undefined') {
      if(this.state.password_valid) {
        // Got a good password set
        validation_markup = <h4>Unencrypting wallet...</h4>;
      }
      else {
        // Bad password entered
        validation_markup = <h4 className="red">ERROR: Incorrect password.<br />{this.state.err_logs}</h4>;
      }
    }
    let classes = this.props.hide ? 'hideLoading' : '';
    if(process.platform.includes("darwin")) {
      classes = `${classes} macosx-loading`;
    }
    classes = `${classes} passwordPrompt`;
    let fields = <h4>Loading...</h4>;
    if(!this.state.freeze_input) { 
      fields = (<div>
      <input
      autoFocus
      onKeyDown={this._handleKeyDown.bind(this)} type="password" onChange={this.set_pass.bind(this)} placeholder="Your wallet password" />
      <br />
      <Button
        className="topMargin"
        bsStyle='primary'
        onClick={() => {this.open_wallet()}}>
        SUBMIT
      </Button>
      </div>);
    }
    return (
        <div id="loading" className={classes}>
          <div className="centered vcenter">
            <h4>Wallet Password:</h4>
            {fields}
            <br />
            {validation_markup}
            <div className="marginAuto width25em topMargin dashedBorderOnHover redBorder italicsAppearRedOnHover">
              {this.state.confirmingWalletReset ?
                <div>
                  <h4>ARE YOU SURE?</h4>
                  <p className="lockScreenWarning">This will erase the local version of your wallet entirely. If you want to access funds previously stored in this wallet, you must recover using your 24-word recovery phrase.</p>
                  <br />
                  <Button
                      bsStyle='danger'
                      onClick={() => {this.confirmResetWallet()}}>
                      DESTROY WALLET
                  </Button>
                  <p className="fixed1emHorizontalMargin"></p>
                  <Button
                      bsStyle='primary'
                      onClick={() => {this.cancelResetWallet()}}>
                      CANCEL
                  </Button>
                </div>
              :
              
              <div>
                <i className=''>DANGER ZONE</i><br />
                <h2 className='red btn' onClick={this.resetWallet.bind(this)}>Reset Wallet</h2>
              </div>
              }
            </div>
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  return state;
}

export default connect(
  mapStateToProps,
  null
)(WalletEncrypted);