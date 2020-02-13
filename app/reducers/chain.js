// @flow
import { CHAIN_UPDATE_SEED_HEIGHT, CHAIN_UPDATE_LOCAL_HEIGHT, CHAIN_UPDATE_OUTPUTS, CHAIN_UPDATE_WALLET_SUMMARY, CHAIN_UPDATE_WALLET_TXS, CHAIN_UPDATE_LOG } from '../actions/chain';
import type { Action } from './types';

const defaultState = {
    seed_height: 0,
    local_height: 0,
    outputs: [],
    wallet_summary: {},
    synchronized: false,
    wallet_txs: [],
    server_log: ' -- Server logs -- ',
    wallet_log: ' -- Wallet logs -- ',
    time_of_last_block: Date.now()
} 

export default function(state = defaultState, action: Action) {
    const getNextState = () => {
        switch (action.type) {
        case CHAIN_UPDATE_SEED_HEIGHT:
            return {...state, seed_height: action.payload};
        case CHAIN_UPDATE_LOCAL_HEIGHT:
            let synchronized = false;
            if(action.payload == state.seed_height && typeof(state.seed_height) != 'undefined') {
                synchronized = true;
            }
            if(state.local_height !== action.payload) {
                // New block
                console.log(`## New Block #${action.payload}`);
                return {...state, local_height: action.payload, synchronized: synchronized, time_of_last_block: Date.now()};
            }
            return {...state, local_height: action.payload, synchronized: synchronized};
        case CHAIN_UPDATE_OUTPUTS:
            return {...state, outputs: action.payload};
        case CHAIN_UPDATE_WALLET_SUMMARY:
            return {...state, wallet_summary: action.payload};
        case CHAIN_UPDATE_WALLET_TXS:
            return {...state, wallet_txs: action.payload};
        case CHAIN_UPDATE_LOG:
            if(action.payload.type == 'server') {
                // console.log(`#@: ${JSON.stringify(action.payload)}`);
                // console.log(action.payload.txt);
                // console.log(state.server_log);
                return {...state, server_log: action.payload.txt + "\n" + state.server_log};
            }
            else {
                return {...state, wallet_log: action.payload.txt + "\n" + state.wallet_log};
            }
        default:
            return state;
        }
    }
    const newState = getNextState();
    return newState;
}