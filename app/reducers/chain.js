// @flow
import { CHAIN_UPDATE_SEED_HEIGHT, CHAIN_UPDATE_LOCAL_HEIGHT, CHAIN_UPDATE_OUTPUTS, CHAIN_UPDATE_WALLET_SUMMARY, CHAIN_UPDATE_WALLET_TXS } from '../actions/chain';
import type { Action } from './types';

const defaultState = {
    seed_height: 0,
    local_height: 0,
    outputs: [],
    wallet_summary: {},
    synchronized: false,
    wallet_txs: []
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
            return {...state, local_height: action.payload, synchronized: synchronized};
        case CHAIN_UPDATE_OUTPUTS:
            return {...state, outputs: action.payload};
        case CHAIN_UPDATE_WALLET_SUMMARY:
            return {...state, wallet_summary: action.payload};
        case CHAIN_UPDATE_WALLET_TXS:
            return {...state, wallet_txs: action.payload};
        default:
            return state;
        }
    }
    const newState = getNextState();
    return newState;
}