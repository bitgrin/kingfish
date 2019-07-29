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
    this.state = {}
  }
  open_wallet() {
      bitgrin.wallet_helper.set_pass(this.pass);
  }
  set_pass(e) {
    console.log(e.target.value);
    this.pass = e.target.value;
  }
  render() {
    let classes = this.props.hide ? 'hideLoading' : '';
    if(process.platform.includes("darwin")) {
      classes = `${classes} macosx-loading`;
    }
    return (
        <div id="loading" className={classes}>
                <div className="centered vcenter">
                    <h4>Enter wallet password:</h4>
                    <input onChange={this.set_pass.bind(this)} placeholder="Your wallet password" />
                    <input onClick={this.open_wallet.bind(this)} type="submit" />
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