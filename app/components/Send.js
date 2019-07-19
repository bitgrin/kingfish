// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import {Button, FormGroup, FormControl, HelpBlock, ControlLabel} from 'react-bootstrap';
import * as SendActions from '../actions/send';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import bitgrin from '../utils/bitgrin';
import DragDropFileComponent from './DragDropFileComponent';
import path from 'path';

const METHOD = {
  HTTP: 'HTTP',
  FILE: 'FILE'
}
String.prototype.trunc = String.prototype.trunc ||
      function(n){
          return (this.length > n) ? this.substr(0, n-1) + '&hellip;' : this;
      };

export default class Send extends Component<Props> {
  constructor() {
    super();
    this.state = {
        log_output: '',
        send_method: METHOD.FILE,
        pending_slate_path: undefined
    }
  }
  send_another() {
    this.setState({address: '', log_output: ''});
  }
  sendAsHTTP() {
    let dest = `${this.state.address}`;
    let amount = this.state.amount;
    bitgrin.initiate_http_send(dest, amount, (result) => {
      this.setState({
        ...this.state,
        log_output: `${this.state.log_output}\n${result}`
      })
    });
  }
  sendAsFile() {
    let amount = this.state.amount;
    bitgrin.initiate_file_send(amount, (log_line) => {
      this.setState({
        ...this.state,
        log_output: `${this.state.log_output}\n${log_line}`
      })
    }, (exit_code) => {

    }, (path) => {
      // Success
      this.setState({
        ...this.state,
        pending_slate_path: path,
        log_output: ''
      })
    });
  }
  send() {
    if(this.state.send_method == METHOD.HTTP) {
      this.sendAsHTTP();
    }
    else if(this.state.send_method == METHOD.FILE) {
      this.sendAsFile();
    }
  }
  setAddress(sender) {
    const address = sender.target.value;
    this.setState({...this.state, address});
  }
  setAmount(sender) {
    const amount = parseFloat(sender.target.value);
    this.setState({...this.state, amount: amount});
  }
  setPort(sender) {
    const port = sender.target.value;
    this.setState({...this.state, port: port});
  }
  setSendMethod(method) {
    this.setState({
      ...this.state,
      send_method: method
    })
  }
  finalize_tx() {
    bitgrin.initiate_file_finalize((log_line) =>{
      this.setState({
        ...this.state,
        log_output: `${this.state.log_output}\n${log_line}`
      })
    }, (exit_code) => {
      if(exit_code != 0) {
        alert(`Error with finalized response file. Did you select a response file for a tx you sent?\n${this.state.log_output.trunc(600) || ""}`);
      }
    });
  }
  render() {
    let sendToggle = <div><h4>
      <span className='pointer' onClick={() => {this.setSendMethod(METHOD.FILE)}}>Send Via File</span>
      <span className="menuMargin"></span>
      <span className='underlined orange'>Send Via HTTP</span>
    </h4></div>;
    let sendButton = <Button onClick={this.send.bind(this)} bsStyle="primary">SEND</Button>;
    let sendMarkup = (
      <FormGroup>
        <ControlLabel>Amount To Send</ControlLabel>
        <FormControl onChange={this.setAmount.bind(this)} type="text" label="Text" placeholder="3.14"  defaultValue={this.props.amt || ''} />
        <ControlLabel>Recipient Address</ControlLabel>
        <FormControl onChange={this.setAddress.bind(this)} type="text" label="Text" placeholder="https://123.45.67.89:8515" defaultValue={this.props.address || ''} />
    </FormGroup>
    )
    if(this.state.send_method == METHOD.FILE) {
      // sendToggle = <h4 className='sendToggler' onClick={() => {this.setSendMethod(METHOD.HTTP)}}>Send Via HTTP &raquo;</h4>;
      // sendToggle = <div><h4 className=''>Send Via File<span className='sendToggler' onClick={() => {this.setSendMethod(METHOD.HTTP)}}>Send Via HTTP &raquo;</span></h4></div>;
      sendToggle = <div><h4>
          <span className='orange underlined'>Send Via File</span>
          <span className="menuMargin"></span>
          <span className='pointer' onClick={() => {this.setSendMethod(METHOD.HTTP)}}>Send Via HTTP</span>
        </h4></div>;
      sendMarkup = (
        <FormGroup>
          <br />
          <h4>Step 1. Specify an amount and save the transaction to a file</h4>
          <FormControl onChange={this.setAmount.bind(this)} type="text" label="Text" placeholder="3.14"  defaultValue={this.props.amt || ''} />
        </FormGroup>
      )
      sendButton = <Button onClick={this.send.bind(this)} bsStyle="primary">SAVE TO FILE</Button>;
    }
    let finalize_content = '';
    if(this.state.send_method == METHOD.FILE) {
      finalize_content = (
        <div>
          <hr />
          <h4>Step 3. Broadcast your transaction</h4>
          <p>
            <Button onClick={this.finalize_tx.bind(this)} bsStyle="primary">SELECT FINALIZED FILE</Button>
          </p>
        </div>
      );
    }
    let contents = (
      <div className='rContainer'>
        {sendToggle}
        {sendMarkup}
        <div className='saveContainer'>
            {sendButton}
        </div>
      {finalize_content}
      </div>
    )
    // After a send is performed via HTTP
    if(this.state.log_output != '') {
      contents = (
        <div className='sendContainer'>
          <pre>
            {this.state.log_output}
          </pre>
          {/* <div className='saveContainer'>
              <Button onClick={this.send_another.bind(this)} bsStyle="primary">Send Another</Button>
          </div> */}
        </div>
      )
    }
    if(typeof(this.state.pending_slate_path) != 'undefined') {
      contents = (
        <div className="nomargindiv">
            <h3>Step 1 of 3 Successful!</h3>
            <h4>Send your slate to the recipient, and have them send back a response file:<br /></h4>
            <DragDropFileComponent filename={path.basename(this.state.pending_slate_path)} file_path={this.state.pending_slate_path} />
            <hr />
            <h3>Step 3</h3>
            <h4>Once the receiver sends you their response file, select it here to complete the transaction.</h4>
            <Button bsStyle="success" onClick={this.finalize_tx.bind(this)}>SELECT RESPONSE FILE &raquo;</Button>
        </div>
      )
    }
    return contents;
  }
}