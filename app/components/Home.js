// @flow
import React, { Component } from 'react';
import routes from '../constants/routes';
import styles from './Home.scss';
import bs from './bootstrap/css/bootstrap.min.css';
import Dashboard from './Dashboard';
import DashboardDetailed from './DashboardDetailed';
import Send from './Send';
import Receive from './Receive';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import { Link, Redirect } from 'react-router-dom';
import { Button, Glyphicon } from 'react-bootstrap';
const remote = require('electron').remote;
import receiveHelper from '../utils/bitgrin/receiveHelper';
import { connect } from 'react-redux';
import InitializeWallet from './InitializeWallet';
import Mine from './Mine';
import WalletEncrypted from './WalletEncrypted';
import bitgrin from '../utils/bitgrin';

type Props = {};

class Home extends Component<Props> {
  props: Props;
  constructor() {
    super();
    this.state = {buttonClass: '', showDashboard: true, tabIndex: 0}
  }
  procDeepLink(deep_link = remote.process.argv) {
    this.redirect_to_send = false;
    this.send_tag = '';
    let args = deep_link;
    if(args.length > 1) {
      let arg1 = args[1];
      if(arg1.startsWith("xbg://")) {
        // Example: xbg://NXwwLjAuMC4wOjg1MTU=
        let payment_info = receiveHelper.send_details_from_uri(arg1);
        window.pi = payment_info;
        this.send_tag_override = <Send amt={payment_info.amt} ip={payment_info.address.split(":")[0]} port={payment_info.address.split(":")[1]} />
        this.setState({...this.state, tabIndex: 1})
        this.redirect_to_send = true;
      }
    }
  }
  componentDidMount() {
      // this.procDeepLink(['','xbg://MjEzfDE3NC43MC45Ni4yMjM=.io/invoice'])
      this.procDeepLink()
  }
  onSelectTab(t) {
    this.setState({...this.state, tabIndex: t})
  }
  // onDragEnd(e) {
  //   console.log('dragend');
  //   window.e = e;
  // }
  // onDragOver(e) {
  //   console.log('dragover');
  // }
  // onDrop(e) {
  //   console.log('onDrop');
  // }
  // onDropCapture(e) {
  //   console.log('onDropCapture');
  // }
  render() {
    let containerClasses = 'container';
    let titlebarDragger = '';
    if(process.platform.includes('darwin')) {
      containerClasses = `${containerClasses} macosx-container`;
      titlebarDragger = (
        <div className='macosx-topbar'>
        </div>
      );
    }
    let home = (
      <div className={containerClasses} data-tid="container">
        {titlebarDragger}
        <div>
            <div className='vnum'>v1.1.4</div>
            <div id='topBar'>
                {/* <img className='logo' src="bird300.png" width="64" />
                <h3>Kingfish</h3> */}
                <Tabs onSelect={this.onSelectTab.bind(this)} selectedIndex={this.state.tabIndex}>
                  <TabList>
                    <Tab>BALANCE</Tab>
                    <Tab>DETAIL</Tab>
                    <Tab>SEND</Tab>
                    <Tab>RECEIVE</Tab>
                    <Tab>MINE</Tab>
                  </TabList>
                  <TabPanel>
                    <Dashboard />
                  </TabPanel>
                  <TabPanel>
                    <DashboardDetailed />
                  </TabPanel>
                  <TabPanel>
                    <Send />
                  </TabPanel>
                  <TabPanel>
                    <Receive />
                  </TabPanel>
                  <TabPanel>
                    <Mine />
                  </TabPanel>
                </Tabs>
            </div>
        </div>
        <Link to="/settings" className="settingsButtonContainer"><Glyphicon className='settingsButton' glyph="cog" /></Link>
      </div>
    )
    if(!bitgrin.wallet_helper.wallet_ready()) {
      home = <InitializeWallet />;
    }
    if(bitgrin.readiness == bitgrin.READY_LEVELS.AWAITING_PASSWORD) {
      return <WalletEncrypted />;
    }
    return home;
  }
}

function mapStateToProps(state) {
  return state;
}

export default connect(
  mapStateToProps,
  null
)(Home);