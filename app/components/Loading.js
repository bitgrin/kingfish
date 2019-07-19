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

class Loading extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {}
  }
  render() {
    let sendTagDisabled = false;// !this.props.chain.synchronized;
    let classes = this.props.hide ? 'hideLoading' : '';
    if(process.platform.includes("darwin")) {
      classes = `${classes} macosx-loading`;
    }
    return (
        <div id="loading" className={classes}>
                <div className="logo_animated centered vcenter"></div>
                <h1 className='loadingText centered'>{this.props.message}</h1>
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
)(Loading);