import iphelper from '../iphelper';
import bitgrin from '../bitgrin';
import base64 from 'base-64';

let my_addressv4;
let my_addressv6;
const receiveHelper = {
    version: "1.0.1",
    summary: (cb) => {
        iphelper.get_ips((ips) => {
            if(typeof(ips.remotev4) != 'undefined') {
                my_addressv4 = ips.remotev4;
            }
            if(typeof(ips.remotev6) != 'undefined') {
                my_addressv6 = ips.remotev6;
            }
            receiveHelper.getListenerPortAndIP((wcfg) => {
                if(wcfg.ip != "0.0.0.0") {
                    cb({summary: "Your wallet is not exposed to the outside world!"});
                }
                else {
                    cb({address: `http://${my_addressv4}:${wcfg.port}`});
                }
            })
        });
    },
    getListenerPortAndIP: (cb) => {
        bitgrin.get_wallet_config((cfg) => {
            cb({port: cfg.wallet.api_listen_port, ip: cfg.wallet.api_listen_interface});
        })
    },
    payment_uri_for_amount: (amt) => {
        let invoice_uri = base64.encode(`${amt}|${my_addressv6}`);
        return `xbg://${invoice_uri}.io/invoice`;
    },
    send_details_from_uri: (uri) => {
        let b64_data = (uri.split('xbg://')[1]).split('.io/invoice')[0];
        let decoded;
        try {
            decoded = base64.decode(b64_data);
        }
        catch(e) {
            alert("Error decoding invoice.");
            return;
        }
        let splitted = decoded.split('|');
        let amt = splitted[0];
        let address = splitted[1];
        return {address, amt};
    }
}

export default receiveHelper;