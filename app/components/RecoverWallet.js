// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
// import styles from './RecoverWallet.css';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as SettingsActions from '../actions/settings';
import {Form, Tabs, Tab, Button, FormGroup, FormControl, HelpBlock, ControlLabel, FormLabel} from 'react-bootstrap';
import bitgrin from '../utils/bitgrin';
const wallet = bitgrin.wallet_helper;

class RecoverWallet extends Component<Props> {
    constructor() {
        super();
        this.state = {
            ignore_lost_seed: false,
            pass_msg: '',
            phrase_error: ''
        }
    }
    createNewClicked() {

    }
    recoverSeedClicked() {
        this.setState({
            ...this.state,
            ignore_lost_seed: true
        })
    }
    set_recovery_word(index, e) {
        const word = (e.target.value || '').toLowerCase();
        this.setState({
            ...this.state,
            [`word${index}`]: word
        })
        this.get_recovery_phrase();
    }
    set_password(e) {
        this.setState({
            ...this.state,
            tmp_pass: e.target.value
        })
    }
    set_password2(e) {
        this.setState({
            ...this.state,
            tmp_pass2: e.target.value
        })
    }
    save_password() {
        let tmp_pass = this.state.tmp_pass;
        let tmp_pass2 = this.state.tmp_pass2;
        let pass_msg = '';
        if((tmp_pass||'').length < 3) {
            pass_msg = "Please select a longer password"
        }
        else if(tmp_pass != tmp_pass2) {
            pass_msg = "Passwords do not match";
        }
        else if(typeof(tmp_pass) == 'undefined' || typeof(tmp_pass2) == 'undefined') {
            pass_msg = "Please select a longer password"
        }
        else if(typeof(tmp_pass) != 'undefined' && (tmp_pass.length > 0) && tmp_pass == tmp_pass2) {
            this.setState({
                ...this.state,
                password: this.state.tmp_pass
            })
            return;
        }
        this.setState({
            ...this.state,
            pass_msg
        });
    }
    get_recovery_phrase() {
        let words = [...Array(24).keys()].map((i) => {
            return this.state[`word${i}`];
        })
        window.ph = words;
        return words.join(' ');
    }
    save_recovery() {
        bitgrin.wallet_helper.recover_wallet(this.get_recovery_phrase(), this.state.password, (success) => {
            if(!success) {
                this.setState({
                    ...this.state,
                    phrase_error: 'Error recovering wallet. Are you sure you entered your seed phrase correctly?'
                })
            }
            else {
                this.props.setWalletPassword(wallet.encrypt_str(this.state.password));
            }
        });
    }
    componentDidMount() {
        /*const test_str = "seed phrase here";
        let words = [...Array(24).keys()].map((i) => {
            return test_str.split(' ')[i];
        })
        for(var i=0;i<words.length;i++) {
            let word = words[i];
            this.setState({
                ...this.state,
                [`word${i}`]: word
            })
        }*/
    }
    render() {
        let content = '';

        /*
        // testing 
        const test_str = "seed phrase here";
        let words = [...Array(24).keys()].map((i) => {
            return test_str.split(' ')[i];
        })
        // end testing*/
        let recovery_inputs = [...Array(24).keys()].map((i) => {
            return <FormControl onChange={this.set_recovery_word.bind(this, i)} placeholder={`Word ${i+1}`} className="recovery_input_field" key={i} type="text" label="Text" />;
        })
        content = (
            <div>
                <p className="smallText">Enter your 24-word recovery phrase</p>
                {recovery_inputs}
                <h4 className='error'>{this.state.phrase_error}</h4>
                <Button bsStyle="primary" onClick={this.save_recovery.bind(this)}>DONE</Button>
            </div>
        )
        // Check password exists, and get it from user before showing recovery phrase
        if(typeof(this.state.password) == 'undefined') {
            content = (
                <div>
                    <p className="smallText">Select a <strong>new</strong> password for your wallet</p>
                    <ControlLabel>Enter Password</ControlLabel>
                    <FormControl onChange={this.set_password.bind(this)} placeholder='New password' type="password" label="Text" />
                    <ControlLabel>Enter Password Again</ControlLabel>
                    <FormControl onChange={this.set_password2.bind(this)} placeholder='New password again' type="password" label="Text" /><br />
                    <Button bsStyle="primary" onClick={this.save_password.bind(this)}>SAVE</Button>
                    <h4 className='error'>{this.state.pass_msg}</h4>
                </div>
            );
        }
        // Edge case for deleted seed file
        if(this.props.lost_seed_file && !this.state.ignore_lost_seed) {
            content = (
                <div>
                    <div className="smallText">
                        <span className='error'>ERROR: Wallet file not found!</span><br />
                        <span className='error'>{bitgrin.wallet_helper.get_wallet_seed_path()}</span>
                        <h4 className='orange'>Option 1</h4>
                        Recover your wallet by replacing the missing file:<br />
                        <span>{bitgrin.wallet_helper.get_wallet_seed_path()}</span><br />
                        and then <strong>restart</strong> Kingfish.
                        <br />
                        <br /><h4 className='orange'>Option 2</h4>
                        Know your 24-word recovery phrase?<br /><br />
                        <Button onClick={this.recoverSeedClicked.bind(this)} bsStyle="primary">Restore With Recovery Phrase</Button>
                        <br />
                        <br /><h4 className='orange'>Option 3</h4>
                        Don't have your recovery phrase or wallet seed file? You'll need to start fresh with an empty wallet. Select <span>CREATE</span> tab to proceed.
                    </div>
                </div>
            )
        }
        return (
            <div className='walletContainer'>
                <h4 className='orange'>Recover Wallet</h4>
                {content}
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
)(RecoverWallet);
  