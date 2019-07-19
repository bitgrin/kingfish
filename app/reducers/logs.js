// @flow
import { LOGS_UPDATED } from '../actions/logs';
import type { Action } from './types';

const defaultState = {
    wallet_log: 'Wallet Log:\n',
    server_log: 'Server Log:\n'
}


let log_preview_length = 5000;
function truncate(str){
    if (str.length > log_preview_length)
       return str.substring(0, log_preview_length)+'...';
    else
       return str;
 };
 
 

export default function(state = {}, action: Action) {
    const getNextState = () => {
        switch (action.type) {
        case LOGS_UPDATED:
            let wallet_log_append = action.payload.wallet_log || "";
            let server_log_append = action.payload.server_log || "";
            let new_wallet_log = state.wallet_log || "";
            let new_server_log = state.server_log || "";
            if(wallet_log_append != "") {
                new_wallet_log = wallet_log_append + "\n" + state.wallet_log;
            }
            if(server_log_append != "") {
                new_server_log = server_log_append + "\n" + state.server_log;
            }
            new_wallet_log = truncate(new_wallet_log);
            new_server_log = truncate(new_server_log);
            return {...state,
                wallet_log: new_wallet_log,
                server_log: new_server_log
            }
        default:
            return state;
        }
    }
    const newState = getNextState();
    return newState;
}