import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import Settings from './components/Settings';
import Send from './components/Send';
import Logs from './components/Logs';
import Chain from './Chain';
import Receive from './components/Receive';
import TxHistory from './components/TxHistory';

export default () => (
  <App>
    <Route path="" component={Chain} />
    <Switch>
      <Route path={routes.TXHISTORY} component={TxHistory} />
      <Route path={routes.LOGS} component={Logs} />
      <Route path={routes.SETTINGS} component={Settings} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
