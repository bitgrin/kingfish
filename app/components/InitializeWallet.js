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
import AuthenticateWallet from './AuthenticateWallet';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import bitgrin from '../utils/bitgrin';
const wallet = bitgrin.wallet_helper;

class InitializeWallet extends Component<Props> {
    constructor() {
        super();
        this.state = {tabIndex: -1, lost_seed_file: false}
    }
    componentDidMount() {
        if(wallet.wallet_password_redux_stored() && !wallet.wallet_seed_file_exists()) {
            // Once created a wallet, but the seed file was removed
            this.setState({
                ...this.state,
                tabIndex: 1,
                lost_seed_file: true
            })
            return;
        }
        if(wallet.wallet_seed_file_exists()) {
            // There is a wallet, but no password saved
            this.setState({
                ...this.state,
                tabIndex: 2
            })
            return;
        }
        if(!wallet.wallet_password_redux_stored() && !wallet.wallet_seed_file_exists()) {
            // New user
            this.setState({
                ...this.state,
                tabIndex: 0
            })
        }
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
                    {!wallet.wallet_seed_file_exists() ? '' :<Tab>AUTHENTICATE</Tab>}
                    </TabList>
                    <TabPanel>
                        <CreateWallet />
                    </TabPanel>
                    <TabPanel>
                        <RecoverWallet lost_seed_file={this.state.lost_seed_file} />
                    </TabPanel>
                    {!wallet.wallet_seed_file_exists() ? '' :<TabPanel>
                        <AuthenticateWallet />
                    </TabPanel>}
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
  