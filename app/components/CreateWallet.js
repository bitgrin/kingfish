// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as SettingsActions from '../actions/settings';
import {Form, Tabs, Tab, Button, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import bitgrin from '../utils/bitgrin';
const wallet = bitgrin.wallet_helper;

class CreateWallet extends Component<Props> {
  constructor() {
    super();
    this.state = {pass: 'n/a'};
  }
  componentDidMount() {
  }
  setWalletPassword(e) {
      this.setState({
          ...this.state,
          pass: e.target.value
      });
  }
  setWalletPassword2(e) {
      this.setState({
          ...this.state,
          pass2: e.target.value
      });
  }
  onFormSubmit = e => {
    e.preventDefault();
    create();
  }
  create() {
    if(this.state.pass.length <= 3) {
        // mistmatched password
        this.setState({
            ...this.state,
            msg: "Password too short"
        })
        return;
    }
    if(this.state.pass != this.state.pass2) {
        // mistmatched password
        this.setState({
            ...this.state,
            msg: "Passwords don't match"
        })
        return;
    }
    bitgrin.wallet_helper.create_new_wallet(this.state.pass, (seed_phrase, cbmsg) => {
        bitgrin.wallet_helper.writing_down_recovery_phrase = true;
        if(typeof(seed_phrase) == 'undefined') {
            this.setState({
                ...this.state,
                msg: `
                ${cbmsg}
                ${process.platform}
                ${process.arch}
                ${process.version}
                `
            })
            return;
        }
        this.setState({
            ...this.state,
            seed_phrase,
            show_confirm_screen: false
        })
    })
  }
  confirm_seed() {
    this.setState({
        ...this.state,
        show_confirm_screen: true
    })
  }
  setWord5(e) {
      this.setState({
          ...this.state,
          confirm_word_5: e.target.value
        }, () => {
            this.tryConfirmed()
        });
  }
  setWord15(e) {
    this.setState({
        ...this.state,
        confirm_word_15: e.target.value
    }, () => {
        this.tryConfirmed()
    });
  }
  setWord23(e) {
    this.setState({
        ...this.state,
        confirm_word_23: e.target.value
    }, () => {
        this.tryConfirmed()
    });
  }
  tryConfirmed() {
    //Check if they already entered the phrase
    let ws = this.state.seed_phrase.toLowerCase().trim().split(' ');
    if(
        typeof(this.state.confirm_word_5) != 'undefined' &&
        typeof(this.state.confirm_word_15) != 'undefined' &&
        typeof(this.state.confirm_word_23) != 'undefined' &&
        typeof(this.state.seed_phrase) != 'undefined'
    ) {
        
        if(
            this.state.confirm_word_5.toLowerCase().trim() == ws[4] &&
            this.state.confirm_word_15.toLowerCase().trim() == ws[14] &&
            this.state.confirm_word_23.toLowerCase().trim() == ws[22]
        ) {
            this.props.setWalletPassword(wallet.encrypt_str(this.state.pass));
            bitgrin.wallet_helper.writing_down_recovery_phrase = false;
            this.setState({
                ...this.state,
                show_confirm_screen: false
            })
        }
    }
  }
  render() {
    if(this.state.show_confirm_screen) {
        // Confirm the user KNOWS their seed
        return (
            <div className='walletContainerSeedPhrase'>
                <h4 className='orange'>Confirm Seed Phrase</h4>
                Please enter the following numbered words from your seed phrase.
                <ControlLabel>Word #5</ControlLabel>
                <FormControl onChange={this.setWord5.bind(this)} type="text" label="Text" /><br />
                <ControlLabel>Word #15</ControlLabel>
                <FormControl onChange={this.setWord15.bind(this)} type="text" label="Text" /><br />
                <ControlLabel>Word #23</ControlLabel>
                <FormControl onChange={this.setWord23.bind(this)} type="text" label="Text" /><br />
            </div>
        )
    }
    if(typeof(this.state.seed_phrase) != 'undefined') {
        let seed_phrase_markup = this.state.seed_phrase.toLowerCase().trim().split(' ').map((word, i) => {
            return <li key={i}><span className='seedWordDigit'>#{i + 1}</span>{word}</li>;
        })
        return (
            <div className='walletContainerSeedPhrase'>
                <h4 className='orange'>WRITE THIS DOWN!</h4>
                This is your <span className='orange'>recovery seed phrase</span>. With this, you (or anyone) can get
                <strong> full access</strong> to your wallet at any time. This is also the <strong>only</strong> way 
                to recover your wallet if you lose access to the data on this computer.
                <div className='seedPhrase'><ol>{seed_phrase_markup}</ol></div>
                <div className='seedConfirm'>
                    <Button onClick={this.confirm_seed.bind(this)} bsStyle="primary">I wrote it down.</Button>
                </div>
            </div>
        );
    }
    return (
        <div className='walletContainer'>
            <h3>Create Wallet</h3>
            <form onSubmit={this.onFormSubmit.bind(this)}>
                <ControlLabel>Wallet Password</ControlLabel>
                <FormControl onChange={this.setWalletPassword.bind(this)} type="password" label="Text" /><br />
                <ControlLabel>Confirm Wallet Password</ControlLabel>
                <FormControl onChange={this.setWalletPassword2.bind(this)} type="password" label="Text" /><br />
                <FormGroup>
                    <Button onClick={this.create.bind(this)} bsStyle="primary">CREATE</Button>
                    <p className='error smallText'>{this.state.msg || ''}</p>
                </FormGroup>
            </form>

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
)(CreateWallet);