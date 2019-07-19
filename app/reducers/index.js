// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import settings from './settings';
import logs from './logs';
import chain from './chain';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    settings,
    logs,
    chain
  });
}
