// @flow
import type { GetState, Dispatch } from '../reducers/types';

export const CHAIN_UPDATE_SEED_HEIGHT = 'CHAIN_UPDATE_SEED_HEIGHT';
export const CHAIN_UPDATE_LOCAL_HEIGHT = 'CHAIN_UPDATE_LOCAL_HEIGHT';
export const CHAIN_UPDATE_OUTPUTS = 'CHAIN_UPDATE_OUTPUTS';
export const CHAIN_UPDATE_WALLET_SUMMARY = 'CHAIN_UPDATE_WALLET_SUMMARY';
export const CHAIN_UPDATE_WALLET_TXS = 'CHAIN_UPDATE_WALLET_TXS';
export const CHAIN_UPDATE_LOG = 'CHAIN_UPDATE_LOG';

export function updateSeedHeight(value) {
    return {
        type: CHAIN_UPDATE_SEED_HEIGHT,
        payload: value
    };
}

export function updateLog(value) {
    return {
        type: CHAIN_UPDATE_LOG,
        payload: value
    };
}

export function updateLocalHeight(value) {
    return {
        type: CHAIN_UPDATE_LOCAL_HEIGHT,
        payload: value
    };
}

export function updateOutputs(value) {
    return {
        type: CHAIN_UPDATE_OUTPUTS,
        payload: value
    };
}

export function updateWalletSummary(value) {
    return {
        type: CHAIN_UPDATE_WALLET_SUMMARY,
        payload: value
    };
}

export function updateWalletTxs(value) {
    return {
        type: CHAIN_UPDATE_WALLET_TXS,
        payload: value
    };
}