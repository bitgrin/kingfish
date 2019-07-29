// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as SettingsActions from '../actions/settings';
import {Form, Button, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import CreateWallet from './CreateWallet';
import RecoverWallet from './RecoverWallet';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import bitgrin from '../utils/bitgrin';
const wallet = bitgrin.wallet_helper;

class InitializeWallet extends Component<Props> {
    constructor() {
        super();
        this.state = {tabIndex: -1, lost_seed_file: false}
    }
    componentDidMount() {
        this.setState({
            ...this.state,
            tabIndex: 0
        });
    }
  onSelectTab(t) {
    this.setState({...this.state, tabIndex: t})
  }
  render() {
    return (
        <div className='container' data-tid="container">
            <div id='topBar'>
                <Tabs onSelect={this.onSelectTab.bind(this)} selectedIndex={this.state.tabIndex}>
                    <TabList>
                    <Tab>CREATE</Tab>
                    <Tab>RECOVER</Tab>
                    </TabList>
                    <TabPanel>
                        <CreateWallet />
                    </TabPanel>
                    <TabPanel>
                        <RecoverWallet lost_seed_file={this.state.lost_seed_file} />
                    </TabPanel>
                </Tabs>
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
)(InitializeWallet);
  