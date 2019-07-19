// @flow
import type { GetState, Dispatch } from '../reducers/types';

export const SET_IDLE_TIMEOUT = 'SET_IDLE_TIMEOUT';
export const SET_C31_ENABLED = 'SET_C31_ENABLED';
export const SET_IDLE_MINING_ENABLED = 'SET_IDLE_MINING_ENABLED';
export const SET_OUTSIDE_WORLD_PAYMENTS_ENABLED = 'SET_OUTSIDE_WORLD_PAYMENTS_ENABLED';

// Wallet stuff
export const SET_WALLET_PASSWORD = 'SET_WALLET_PASSWORD';
export const SET_ENCRYPTED_SEED = 'SET_ENCRYPTED_SEED';

export function setWalletPassword(value) {
    return {
        type: SET_WALLET_PASSWORD,
        payload: value
    };
}

export function setEncryptedSeed(value) {
    return {
        type: SET_ENCRYPTED_SEED,
        payload: value
    };
}

export function setOutsideWorldPaymentsEnabled(value) {
    return {
        type: SET_OUTSIDE_WORLD_PAYMENTS_ENABLED,
        payload: value
    };
}

export function setIdleTimeout(value) {
    return {
        type: SET_IDLE_TIMEOUT,
        payload: value
    };
}

export function setC31Enabled(value) {
    return {
        type: SET_C31_ENABLED,
        payload: value
    };
}

export function setIdleMiningEnabled(value) {
    return {
        type: SET_IDLE_MINING_ENABLED,
        payload: value
    };
}

// Not an action
export function save(cb) {
    console.log('save triggered');
    cb();
}