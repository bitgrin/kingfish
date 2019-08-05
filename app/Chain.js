// @flow
import { TransitionGroup, Transition } from 'react-transition-group';
import React, { Component } from 'react';
import bitgrin from './utils/bitgrin';
import * as ChainActions from './actions/chain';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Loading from './components/Loading';

// Toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Logs
import TailLib from 'tail';
const Tail = TailLib.Tail;

class Chain extends Component<Props> {
  constructor() {
    super();
    setTimeout(this.updateLoop.bind(this), 100);
    this.state = {
      outputs: [],
      height: 0,
      loadingMessage: 'Loading...',
      isLoading: true,
      wallet_log_str: ' -- Wallet log --',
      server_log_str: ' -- Server log --'
    }
    bitgrin.bootstrap();
    // toast.info(`Incoming Payment: ${amt} XBG`, {autoClose: 3000});
    window.toast = toast;
  }
  componentDidMount() {
    this.listen_to_logs();
  }
  insert_log(data, log_type) {
      let lines = [];
      if(typeof(data) == 'string') {
          lines = [data];
      }
      else {
          lines = data.split('\n').reverse().join('\n');
      }
      this.props.updateLog({
        type: log_type,
        txt: data
      });
  }
  listen_to_logs() {
    let logComponent = this;
    this.server_tail = new Tail(bitgrin.get_server_log_path());
    this.server_tail.on("line", function(data) {
        logComponent.insert_log(data, 'server');
    });

    this.server_tail.on("error", function(error) {
        logComponent.insert_log(error, 'server');
    });

    this.wallet_tail = new Tail(bitgrin.get_wallet_log_path());
    this.wallet_tail.on("line", function(data) {
        logComponent.insert_log(data, 'wallet');
    });
    
    this.wallet_tail.on("error", function(error) {
        logComponent.insert_log(error, 'wallet');
    });
  }
  updateLoop() {
    setTimeout(this.updateLoop.bind(this), 3000);
    if(bitgrin.readiness == bitgrin.READY_LEVELS.NONE) {
      this.setState({
        ...this.state,
        isLoading: true,
        loadingMessage: 'Initializing Kingfish...'
      })
    }
    else if(bitgrin.readiness == bitgrin.READY_LEVELS.DOWNLOADING) {
      this.setState({
        ...this.state,
        isLoading: true,
        loadingMessage: 'Downloading BitGrin Node...'
      })
    }
    else if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
      this.setState({
        ...this.state,
        isLoading: true,
        loadingMessage: 'Shutting Down...'
      })
    }
    else if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN) {
      this.setState({
        ...this.state,
        isLoading: true,
        loadingMessage: 'Goodbye!'
      })
    }
    else {
      this.setState({
        ...this.state,
        loadingMessage: 'BitGrin'
      })
      setTimeout(() => {
        this.setState({
          ...this.state,
          isLoading: false
        })
      }, 1500);
    }
    if(bitgrin.readiness != bitgrin.READY_LEVELS.READY) {
      return;
    }
    bitgrin.chain_status.get_seed_height((h) =>{
      this.props.updateSeedHeight(h)
    });
    bitgrin.chain_status.get_local_height((h) =>{
      this.props.updateLocalHeight(h)
    });
    bitgrin.get_wallet_outputs((outputs) => {
      console.log(`outputs length: ${outputs.length}   this.props.chain.outputs.length: ${this.props.chain.outputs.length}`);
      if(outputs.length > this.props.chain.outputs.length) {
        // Additional outputs detected, check if they are recent
        let output_height = outputs[outputs.length-1].output.height;
        let seed_height = this.props.chain.seed_height;
        let height_delta = Math.abs(seed_height - output_height);
        if(height_delta < 60) {
          // Output occured within last hour, notify the user
          let amt = bitgrin.to_xbg(outputs[outputs.length-1].output.value);
          toast.info(`Incoming Payment: ${amt} XBG`, {autoClose: 4000});
        }
      }
      this.props.updateOutputs(outputs)
    })
    bitgrin.get_wallet_summary((summary) => {
      this.props.updateWalletSummary(summary)
    });
    bitgrin.get_wallet_txs((txs) => {
      this.props.updateWalletTxs(txs)
    });
  }
  render() {
    return (<div>
        <ToastContainer className='infoToast' position="bottom-right" autoClose={1000} hideProgressBar={true} />
        <Loading message={this.state.loadingMessage} hide={!this.state.isLoading} />
      </div>);
  }
}

function mapStateToProps(state) {
    return state;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ChainActions, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Chain);
  