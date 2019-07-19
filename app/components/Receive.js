// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import bitgrin from '../utils/bitgrin';
const { clipboard } = require('electron');
import { Button, Glyphicon } from 'react-bootstrap';
// import styles from './Receive.css';
import receiveHelper from '../utils/bitgrin/receiveHelper';
import {shell} from 'electron';
import DragDropFileComponent from './DragDropFileComponent';
import path from 'path';

const METHOD = {
    HTTP: 'HTTP',
    FILE: 'FILE'
}
export default class Send extends Component<Props> {
  constructor() {
    super();
    this.state = {
        local_ip: '???',
        remote_ip: '???',
        summary: 'Loading...',
        invoice_amt: '0',
        payment_link: '',
        loading: true,
        receive_method: METHOD.FILE,
        log_output: '',
        pending_response_path: undefined
    }
  }
  componentDidMount() {
    bitgrin.receiveHelper.summary((s) => {
        this.setState({...this.state,
            summary: s.summary,
            address: s.address,
            loading: false
        })
    })
  }
  copyIP() {
      clipboard.writeText(this.state.address);
    //   toast.info("Copied!");
  }
  exposeWallet() {
    bitgrin.changeWalletTomlFeature(bitgrin.features.WALLET_LISTEN_WORLD, true);
    bitgrin.receiveHelper.summary((s) => {
        this.setState({...this.state,
            summary: s.summary,
            address: s.address
        })
    })
  }
  copyPaymentLink() {
    // toast.info("Copied!");
    clipboard.writeText(this.state.payment_link);
  }
  set_invoice_amt(sender) {
    this.setState({...this.state,
        invoice_amt: sender.target.value,
        payment_link: receiveHelper.payment_uri_for_amount(sender.target.value)
    })
  }
  setReceiveMethod(method) {
    this.setState({
        ...this.state,
        receive_method: method
    })
  }
  receiveFromFile() {
    bitgrin.initiate_file_receive((slate_path) => {
        this.setState({
            ...this.state,
            pending_response_path: slate_path
        })
    }, (log_line) => {
        this.setState({
          ...this.state,
          log_output: `${this.state.log_output}\n${log_line}`
        })
      }, (exit_code) => {
        if(exit_code == 0) {
          // No error
        }
        else {
          // Error happened
          console.log(`Exit with code: ${exit_code}`);
        }
    });
  }
  showInExplorer() {
    shell.showItemInFolder(this.state.pending_response_path);
  }
  render() {
    // let receiveToggle = <h4 className='sendToggler' onClick={() => {this.setReceiveMethod(METHOD.FILE)}}>Receive Via File &raquo;</h4>;
    let receiveToggle = <div><h4>
        <span className='pointer' onClick={() => {this.setReceiveMethod(METHOD.FILE)}}>Receive Via File</span>
        <span className="menuMargin"></span>
        <span className='underlined orange'>Receive Via HTTP</span>
    </h4></div>;

    let id = "id";
    let rcontent;
    let invoice_markup = (
        <div><span className='smallPaymentLink'>{this.state.payment_link}</span> <Glyphicon onClick={this.copyPaymentLink.bind(this)} className='copyIPButton' glyph="copy" /></div>
    )
    if(this.state.loading) {
        return '';
    }
    let receiveMarkup = (
        <div>
            {receiveToggle}
            <span>Your payment address: </span>
            <span>{this.state.address}</span> <Glyphicon onClick={this.copyIP.bind(this)} className='copyIPButton' glyph="copy" />
            <br />
            <h5>Example usage for sender:</h5>
            <pre>
    ./bitgrin-wallet send -d {this.state.address} 0.2
            </pre>
            {/* <br />
                <h4>Use BitGrin invoice payment link: </h4>
                <input onChange={this.set_invoice_amt.bind(this)} placeholder="1.0 XBG" />
                { (this.state.payment_link == '') ? '' : invoice_markup }
                
                <br /> */}
        </div>
    )
    if(this.state.receive_method == METHOD.FILE) {
        receiveToggle = <div><h4>
            <span className='underlined orange'>Receive Via File</span>
            <span className="menuMargin"></span>
            <span className='pointer' onClick={() => {this.setReceiveMethod(METHOD.HTTP)}}>Receive Via HTTP</span>
        </h4></div>;
        let log_output_markup = '';
        if(this.state.log_output != '') {
            log_output_markup = (
                <pre>{this.state.log_output}</pre>
            )
        }
        receiveMarkup = (
            <div>
                {receiveToggle}
                <br />
                <h4>Select the file the sender of a transaction created to sign a response.</h4>
                <Button bsStyle="primary" onClick={this.receiveFromFile.bind(this)}>OPEN RECEIVE FILE &raquo;</Button>
                {log_output_markup}
            </div>
        );
        if(typeof(this.state.pending_response_path) != 'undefined') {
            // There is a response tx file waiting to be returned to sender
            const response_instruction = (
                <div className="nomargindiv">
                    <h3>Step 2 of 3 Complete!</h3>
                    <h4>Send your response file back to the sender for broadcast:<br /></h4>
                    <DragDropFileComponent filename={path.basename(this.state.pending_response_path)} file_path={this.state.pending_response_path} />
                    <h5>
                        NOTE: Your transaction is not complete until after the sender broadcasts this transaction!
                        Please wait until your coins have been spendable, 10 blocks after <strong>broadcast by the sender</strong>.
                    </h5>
                </div>
            )
            receiveMarkup = (
                <div className="nomargindiv">
                    {response_instruction}
                </div>
            )
        }
    }
    // Check for world exposed wallet for HTTP receives
    if(typeof(this.state.address) != 'undefined' || this.state.receive_method == METHOD.FILE) {
        rcontent = receiveMarkup;
        // "xbg://sto|0.0017|127.0.0.1:8515|"
    }
    else {
        rcontent = (
            <div>
                <h4>Oops! {this.state.summary}</h4><br />
                <Button bsStyle="success" onClick={this.exposeWallet.bind(this)}>Expose Wallet To World</Button>
            </div>
        )
    }

    return (
        <div className='rContainer'>
            <div>
                {rcontent}
            </div>
        </div>
    );
  }
}