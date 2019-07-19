// @flow
import type { GetState, Dispatch } from '../reducers/types';

export const LOGS_UPDATED = 'LOGS_UPDATED';

export function logsUpdated(value) {
    return {
        type: LOGS_UPDATED,
        payload: value
    };
}