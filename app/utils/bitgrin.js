// @flow
import os from 'os';
import path from 'path';
import TOML from '@iarna/toml';
import natUpnp from 'nat-upnp';
import fs from 'fs';
import concat from 'concat-stream';
const {spawn} = require('child_process');
const { execFile } = require('child_process');
import {logsUpdated} from '../actions/logs';
import base64 from 'base-64';
import receiveHelper from './bitgrin/receiveHelper';
const request = require('request');
var AdmZip = require('adm-zip');
const isPortReachable = require('is-port-reachable');
import iphelper from './iphelper';
import chain_status from './bitgrin/chain_status';
import file_tx_helper from './bitgrin/file_tx_helper';
import words from './words';
import pay from './bitgrin/pay';
import wallet_helper from './bitgrin/wallet_helper';
import sync from './bitgrin/sync';
const {shell} = require('electron');
const {app} = require('electron').remote;
const kill  = require('tree-kill');

const con = require('electron').remote.getGlobal('console')

// TODO: move out of this lib?
import { dispatch } from 'redux';

const user_home_path = () => {
    return os.homedir();
}
const bitgrin_main_path = () => {
    return path.join(user_home_path(), '.bitgrin/main');
}
const get_server_toml_path = () => {
    return path.join(bitgrin_main_path(), 'bitgrin-server.toml');
}
const get_wallet_toml_path = () => {
    return path.join(bitgrin_main_path(), 'bitgrin-wallet.toml');
}
const get_pending_slate_path = () => {
    return path.join(bitgrin_main_path(), 'slates');
}
const wallet_api_secret_path = () => {
    return path.join(bitgrin_main_path(), '.api_secret');
}
const owner_api_base = "http://127.0.0.1:8520";
const bitgrin_version = '2.0.0-beta-4';
const bg_root = path.join(os.homedir(), ".bitgrin");
const bg_bin_directory = path.join(bg_root, "bin");

const bg_bin_path_noshell = `${path.join(bg_bin_directory, `bitgrin-${bitgrin_version}/bitgrin`)}`;
const bg_bin_path = `"${path.join(bg_bin_directory, `bitgrin-${bitgrin_version}/bitgrin`)}"`;

const bg_wallet_bin_path_noshell = `${path.join(bg_bin_directory, `bitgrin-${bitgrin_version}/bitgrin-wallet`)}`;
const bg_wallet_bin_path = `"${path.join(bg_bin_directory, `bitgrin-${bitgrin_version}/bitgrin-wallet`)}"`;

const bg_bin_zip_path = `${path.join(bg_bin_directory, `Bitgrin-${bitgrin_version}.zip`)}`;
const download_path = () => {
    let download_path_win = `https://github.com/bitgrin/bitgrin/releases/download/v${bitgrin_version}/BitGrin-Windows-10-64Bit-${bitgrin_version}.zip`;
    let download_path_mac = `https://github.com/bitgrin/bitgrin/releases/download/v${bitgrin_version}/BitGrin-Mac-OS-${bitgrin_version}.zip`;
    if(process.platform.includes('darwin')) {
        console.log(download_path_mac);
        return download_path_mac;
    }
    console.log(download_path_win);
    return download_path_win;
}
var _bitgrin_wallet_process = null;
var _bitgrin_server_process = null;
var _bitgrin_wallet_owner_api_process = null;
var server_log = '';
var wallet_log = '';
var store = null;
const unzip_bin = (zip_path, dest_path) => {
    var zip = new AdmZip(zip_path);
	var zipEntries = zip.getEntries();
	zip.extractAllTo(dest_path, /*overwrite*/true);
}
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
const download_bin_zip = async (url, cb) => {
    download(url, bg_bin_zip_path, (msg) => {
        console.log(msg);
        unzip_bin(bg_bin_zip_path, bg_bin_directory);
        if(process.platform.includes('darwin')) {
            // Set executable
            fs.chmodSync(bg_bin_path_noshell, "755");
            fs.chmodSync(bg_wallet_bin_path_noshell, "755");
        }
        cb();
    })
}
const READY_LEVELS = {
    READY: 'READY',
    DOWNLOADING: 'DOWNLOADING',
    CREATING_WALLET: 'CREATING_WALLET',
    NONE: 'NONE',
    SHUTTING_DOWN: 'SHUTTING_DOWN',
    SHUTDOWN: 'SHUTDOWN',
    AWAITING_PASSWORD: 'AWAITING_PASSWORD'
};
// Returns true if process is ended and null
const end_process = (child, title="None") => {
    if(typeof(child) == 'undefined' || child == null) {
        console.log(`${title} already closed`)
        return true;
    }
    console.log(`kill ${title}`);
    child.kill('SIGINT');
    child.kill();
    child.kill(0);
    return false;
}
const bitgrin = {
    get_pending_slate_path,
    bg_bin_path,
    bg_wallet_bin_path,
    READY_LEVELS,
    _readiness: READY_LEVELS.NONE,
    set_readiness: (r) => {
        bitgrin.readiness = r;
    },
    readiness: () => {
        return bitgrin._readiness;
    },
    safe_shutdown: () => {
        con.log('bitgrin.safe_shutdown()');
        let wallet_shutdown = end_process(_bitgrin_wallet_process, 'wallet_process');
        let server_shutdown = end_process(_bitgrin_server_process, 'server_process');
        let owner_api_shutdown = end_process(_bitgrin_wallet_owner_api_process, 'owner_api_process');
        _bitgrin_wallet_process = null;
        _bitgrin_server_process = null;
        _bitgrin_wallet_owner_api_process = null;
        if(wallet_shutdown && server_shutdown && owner_api_shutdown) {
            setTimeout(bitgrin.set_readiness(bitgrin.READY_LEVELS.SHUTDOWN), 1000);
        }
        else {
            bitgrin.set_readiness(bitgrin.READY_LEVELS.SHUTTING_DOWN);
        }
        return bitgrin.readiness;
    },
    bitgrin_main_path: bitgrin_main_path,
    bootstrap: () => {
        window.bitgrin_shutdown = bitgrin.safe_shutdown;
        window.bitgrin_readiness = bitgrin.readiness;
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        console.log('bitgrin.bootstrap()');
        if(bitgrin.readiness != bitgrin.READY_LEVELS.READY) {
            console.log(`BitGrin not ready for bootstrap... ${bitgrin._readiness}`);
        }
        // First, make sure we actually have a bitgrin binary somewhere
        if(!fs.existsSync(bg_root)) {
            fs.mkdirSync(bg_root);
        }
        if(!fs.existsSync(bg_bin_directory)) {
            fs.mkdirSync(bg_bin_directory);
        }
        if(!fs.existsSync(bg_bin_zip_path)) {
            bitgrin.set_readiness(bitgrin.READY_LEVELS.DOWNLOADING);
            // Doesn't exist, download it...
            download_bin_zip(download_path(), () => {
                // Done downloading
                bitgrin.set_readiness(bitgrin.READY_LEVELS.NONE);
                bitgrin.bootstrap();
            });
            return;
        }
        if(!wallet_helper.wallet_ready()) {
            bitgrin.set_readiness(bitgrin.READY_LEVELS.CREATING_WALLET);
            // Sleep 2000ms and try again
            setTimeout(bitgrin.bootstrap.bind(this), 2000);
            return;
        }
        if(bitgrin.readiness == bitgrin.SHUTTING_DOWN || bitgrin.readiness == bitgrin.SHUTDOWN) {
            return;
        }
        bitgrin.set_readiness(bitgrin.READY_LEVELS.READY);

        console.log('bitgrin.bootstrap()6');
        console.log("Ready!");

        // Start the update loop
        bitgrin.tick();
        /*// Start bitgrin server in the background
        bitgrin.bitgrin_server_process();
        // Start bitgrin wallet in the background
        bitgrin.bitgrin_wallet_listen_process();
        // Start bitgrin wallet owner_api in the background
        bitgrin.bitgrin_wallet_owner_api_process();*/
    },
    tick: () => {
        console.log('tick');
        // Keep processes alive and password correct update loop
        if(_bitgrin_wallet_process == null) {
            bitgrin.bitgrin_wallet_listen_process();
        }
        if(_bitgrin_server_process == null) {
            bitgrin.bitgrin_server_process();
        }
        if(_bitgrin_wallet_owner_api_process == null) {
            bitgrin.bitgrin_wallet_owner_api_process();
        }

        setTimeout(bitgrin.tick.bind(this), 2000);
    },
    set_store: (_store) => {
        store = _store;
    },
    get_logs: () => {
        return {server_log, wallet_log};
    },
    get_store: () => {
        return store;
    },
    get_api_secret: (cb) => {
        let rs = fs.createReadStream(wallet_api_secret_path(), 'utf8');
        rs.pipe(concat(function(data) {
            cb(data);
        }));
        
        setTimeout(() => {
            rs.close();
            rs = undefined;
        }, 2000);
    },
    owner_api_fetch(method, params, cb) {
        let body = `{
            "jsonrpc": "2.0",
            "method": "${method}",
            "params": ${JSON.stringify(params)},
            "id": 1
        }`;
        bitgrin.get_api_secret((api_key) => {
            fetch(`${owner_api_base}/v2/owner`, {
                method: 'post',
                body: body,
                headers: new Headers({
                    "Authorization": `Basic ${base64.encode(`grin:${api_key}`)}`
                }),
            }).then(response => {
                if (!response.ok) throw new Error(response.status);
                cb(response.json());
            });
        });
    },
    to_xbg: (val) => {
        return val / Math.pow(10, 9);
    },
    get_wallet_summary: (callback) => {
        bitgrin.owner_api_fetch("retrieve_summary_info", [true, 10], (response) => {
            response.then((r) => {
                callback(r["result"]["Ok"][1]);
            })
        });
    },
    get_wallet_outputs: (callback) => {
        bitgrin.owner_api_fetch("retrieve_outputs", [true, true, null], (response) => {
            response.then((r) => {
                let outputs = r["result"]["Ok"][1];
                callback(outputs);
            })
        });
    },
    get_wallet_txs: (callback) => {
        bitgrin.owner_api_fetch("retrieve_txs", [true, null, null], (response) => {
            response.then((r) => {
                let outputs = r["result"]["Ok"][1];
                callback(outputs);
            })
        });
    },
    run_wallet_check: async (callback, log_callback) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        let m_pass = await wallet_helper.wallet_pass();
        let cmds = `${bg_wallet_bin_path} -p="${m_pass}" check`;
        let child_process = spawn(cmds, {shell: true});
        
        child_process.stdout.on('data', function (data) {
            log_callback(data.toString());
        });
        
        child_process.stderr.on('data', function (data) {
            log_callback(data.toString());
        });
        
        child_process.on('exit', function (code) {
            callback();
        });
    },
    initiate_file_receive: (path_callback, log_callback, process_ended_cb) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        file_tx_helper.select_slate_file_on_disk((slate_path) => {
            if(typeof(slate_path) == 'undefined') {
                return;
            }
            bitgrin.perform_file_receive(slate_path, log_callback, (exit_code) => {
                if(exit_code == 0) {
                    // Success
                    const responseExt = '.tx.response';
                    const txFileName = path.basename(slate_path, path.extname(slate_path)) + responseExt;
                    const responseFileName = path.join(path.dirname(slate_path), txFileName);
                    path_callback(responseFileName);
                }
            });
        });
    },
    perform_tx_finalize: async (slate_path, log_callback, process_ended_cb) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        //grin wallet finalize -i any_transaction_name.tx.response
        let m_pass = await wallet_helper.wallet_pass();
        let finalize_string = `${bg_wallet_bin_path} -p="${m_pass}" finalize -i "${slate_path}"`;
        let child_process = spawn(finalize_string, {shell: true});
        child_process.stdout.on('data', function (data) {
            console.log(data.toString());
            log_callback(data.toString());
        });
        child_process.stderr.on('data', function (data) {
            console.log(data.toString());
            log_callback(data.toString());
        });
        child_process.on('exit', function (code) {
            console.log(`EXIT WITH CODE: ${code}`);
            process_ended_cb(code);
        });
    },
    initiate_file_finalize: (log_callback, process_ended_cb) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        file_tx_helper.select_slate_file_on_disk((slate_path) => {
            if(typeof(slate_path) != 'undefined') {
                bitgrin.perform_tx_finalize(slate_path, log_callback, process_ended_cb);
            }
        });
    },
    initiate_file_send: (amount, log_callback, process_ended_cb, successful_path_cb) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        let rand_file = `${words.random_words(4).join('')}.tx`;
        // No save as since drag and drop is easier
        let rPath = path.join(app.getPath('documents'), rand_file);
        console.log(`Save to: ${rPath}`);
        bitgrin.perform_file_send(amount, rPath, log_callback, (process_exit_code) => {
            if(process_exit_code==0) {
                successful_path_cb(rPath);
            }
            else {
                process_ended_cb(process_exit_code);
            }
        });
    },
    perform_file_send: async (amount, path, log_callback, process_ended_cb) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        //grin wallet send -m file -d my_grin_transaction.tx 10.25
        let m_pass = await wallet_helper.wallet_pass();
        let send_str = `${bg_wallet_bin_path} -p="${m_pass}" send -m file -d "${path}" ${amount}`;
        console.log(send_str);
        let child_process = spawn(send_str, {shell: true});
        child_process.stdout.on('data', function (data) {
            console.log(data.toString());
            log_callback(data.toString());
        });
        child_process.stderr.on('data', function (data) {
            console.log(data.toString());
            log_callback(data.toString());
        });
        child_process.on('exit', function (code) {
            console.log(`EXIT WITH CODE: ${code}`);
            process_ended_cb(code);
        });
    },
    perform_file_receive: async (slate_path, log_callback, process_ended_cb) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        //grin wallet receive -i any_transaction_name.tx
        let m_pass = await wallet_helper.wallet_pass();
        let receive_str = `${bg_wallet_bin_path} -p="${m_pass}" receive -i "${slate_path}"`;
        let child_process = spawn(receive_str, {shell: true});
        child_process.stdout.on('data', function (data) {
            console.log(data.toString());
            log_callback(data.toString());
        });
        child_process.stderr.on('data', function (data) {
            console.log(data.toString());
            log_callback(data.toString());
        });
        child_process.on('exit', function (code) {
            console.log(`EXIT WITH CODE: ${code}`);
            process_ended_cb(code);
        });
    },
    initiate_http_send: async (dest, amount, callback) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        let m_pass = await wallet_helper.wallet_pass();
        let send_str = `${bg_wallet_bin_path} -p="${m_pass}" send -d "${dest}" ${amount}`;
        let child_process = spawn(send_str, {shell: true});
        child_process.stdout.on('data', function (data) {
            console.log(data.toString());
            callback(data.toString());
        });
        child_process.stderr.on('data', function (data) {
            console.log(data.toString());
            callback(data.toString());
        });
        child_process.on('exit', function (code) {
            console.log(`EXIT WITH CODE: ${code}`);
        });
    },
    bitgrin_wallet_owner_api_process: async () => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        console.log('start bitgrin_wallet_owner_api_process');
        if(typeof(_bitgrin_wallet_owner_api_process == 'undefined')) {
            let m_pass = await wallet_helper.wallet_pass();
            let child_process = spawn(bg_wallet_bin_path_noshell, [`-p=${m_pass}`, 'owner_api']);

            _bitgrin_wallet_owner_api_process = child_process;

            child_process.stdout.on('data', function (data) {
                console.log(data.toString());
            });
            
            child_process.stderr.on('data', function (data) {
                console.log(data.toString());
            });
            
            child_process.on('exit', function (code) {
                // Try to restart it
                _bitgrin_wallet_owner_api_process = null;
                console.log(`wallet owner_api exit ${code}`);
                setTimeout(2000, () => {
                    bitgrin.bitgrin_wallet_owner_api_process();
                });
            });
        }
    },
    bitgrin_wallet_listen_process: async () => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        bitgrin.testUpnpn();
        if(typeof(_bitgrin_wallet_process == 'undefined')) {

            let m_pass = await wallet_helper.wallet_pass();
            let child_process = spawn(bg_wallet_bin_path_noshell, [`-p=${m_pass}`, '-e', 'listen']);

            _bitgrin_wallet_process = child_process;
            
            child_process.stdout.on('data', function (data) {
                wallet_log += data.toString();
                if(typeof(store) != 'undefined') {
                    store.dispatch(logsUpdated({wallet_log: data.toString()}));
                }
            });
            
            child_process.stderr.on('data', function (data) {
                wallet_log += data.toString();
            });
            
            child_process.on('exit', function (code) {
                wallet_log += `EXIT WITH CODE: ${code}`;
                // Try to restart it
                setTimeout(() => {
                    _bitgrin_wallet_process = null;
                    bitgrin.bitgrin_wallet_listen_process();
                }, 2000);
            });
        }
    },
    bitgrin_server_process: () => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        console.log('start bitgrin_server_process');
        if(typeof(_bitgrin_server_process == 'undefined')) {
            console.log("Instantiating bitgrin server process");
            let child_process = spawn(bg_bin_path_noshell, ['server', '-t', 'run']);
            _bitgrin_server_process = child_process;
            child_process.stdout.on('data', function (data) {
                console.log(data.toString());
                server_log += data.toString() || data || "";
                if(typeof(store) != 'undefined') {
                    store.dispatch(logsUpdated({server_log: data.toString()}));
                }
                else {
                    console.log('Store is undefined when attempting to start bitgrin server process');
                }
            });
            
            child_process.stderr.on('data', function (data) {
                console.log(data.toString());
                server_log += data.toString() || data || "";
            });
            
            child_process.on('exit', function (code) {
                console.log(`EXIT SERVER CODE ${code}`);
                server_log += `EXIT WITH CODE: ${code}`;
                // Try to restart it
                setTimeout(2000, () => {
                    bitgrin.bitgrin_server_process();
                });
            });
            child_process.on('close', function (code, signal) {
                console.log(`CLOSE SERVER`);
                server_log += `CLOSE WITH CODE: ${code} -- SIGNAL: ${signal}`;
                // Try to restart it
                setTimeout(2000, () => {
                    bitgrin.bitgrin_server_process();
                });
            });
        }
    },
    uPnpclient: natUpnp.createClient(),
    testUpnpn: () => {
        bitgrin.uPnpclient.portMapping({
            public: 8515,
            private: 8515,
            ttl: 10
        }, function(err) {
            // Will be called once finished
            console.log('portMapping done');
        });
    },
    features: {
        WALLET_LISTEN_WORLD: 'WALLET_LISTEN_WORLD',
        ENABLE_STRATUM: 'ENABLE_STRATUM',
        ENABLE_TUI: 'ENABLE_TUI'
    },
    restart_wallet_owner_api: () => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        // Restart wallet
        _bitgrin_wallet_owner_api_process.kill('SIGKILL');
        setTimeout(2000, () => {
            bitgrin.bitgrin_wallet_owner_api_process();
        })
    },
    restart_wallet: () => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        // Restart wallet
        _bitgrin_wallet_process.kill('SIGKILL');
        setTimeout(2000, () => {
            bitgrin.bitgrin_wallet_listen_process();
        })
    },
    restart_server: () => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            return;
        }
        // Restart server
        _bitgrin_server_process.kill('SIGKILL');
        setTimeout(2000, () => {
            bitgrin.bitgrin_server_process();
        })
    },
    write_wallet_toml: (toml) => {
        let ws = fs.createWriteStream(get_wallet_toml_path(), 'utf8');
        ws.on('open', function(fd) {
            ws.write(Buffer.from(TOML.stringify(toml)));
            ws.close();
        });
    },
    write_server_toml: (toml) => {
        let ws = fs.createWriteStream(get_server_toml_path(), 'utf8');
        ws.on('open', function(fd) {
            ws.write(Buffer.from(TOML.stringify(toml)));
            ws.close();
        });
    },
    changeWalletTomlFeature: (feature, value) => {
        let rs = fs.createReadStream(get_wallet_toml_path(), 'utf8');
        rs.pipe(concat(function(data) {
            var parsed = TOML.parse(data);
            window.p = parsed;
            switch(feature) {
                case bitgrin.features.WALLET_LISTEN_WORLD:
                if(value == true) {
                    window.p = parsed;
                    parsed.wallet.api_listen_interface = "0.0.0.0";
                    parsed.wallet.api_secret_path = "#";
                }
                else {
                    parsed.wallet.api_listen_interface = "127.0.0.1";
                    parsed.wallet.api_secret_path = "#";
                }
                bitgrin.write_wallet_toml(parsed);
                break;
            }
        }));
        setTimeout(() => {
            rs.close();
            rs = undefined;
        }, 2000);
    },
    changeServerTomlFeature: (feature, value) => {
        let rs = fs.createReadStream(get_server_toml_path(), 'utf8');
        rs.pipe(concat(function(data) {
            var parsed = TOML.parse(data);
            window.ppf = parsed;
            switch(feature) {
                case bitgrin.features.ENABLE_TUI:
                if(value == true) {
                    parsed.server.run_tui = true;
                }
                else {
                    parsed.server.run_tui = false;
                }
                bitgrin.write_server_toml(parsed);
                break;
            }
        }));
        setTimeout(() => {
            rs.close();
            rs = undefined;
        }, 2000);
    },
    write_toml_features: (state) => {
        bitgrin.changeWalletTomlFeature(bitgrin.features.WALLET_LISTEN_WORLD, state.outsideWorldPayments);
    },
    disable_tui: () => {
        bitgrin.changeServerTomlFeature(bitgrin.features.ENABLE_TUI, false);
    },
    get_wallet_config: (cb) => {
        let rs = fs.createReadStream(get_wallet_toml_path(), 'utf8');
        rs.pipe(concat(function(data) {
            var parsed = TOML.parse(data);
            cb(parsed);
        }));
        setTimeout(() => {
            rs.close();
            rs = undefined;
        }, 2000);
    },
    get_wallet_config_sync: () => {
        let data = fs.readFileSync(get_wallet_toml_path(), {encoding: 'utf8'});
        let parsed = TOML.parse(data);
        return parsed;
    },
    get_server_config: (cb) => {
        let rs = fs.createReadStream(get_server_toml_path(), 'utf8');
        rs.pipe(concat(function(data) {
            var parsed = TOML.parse(data);
            cb(parsed);
        }));
        setTimeout(() => {
            rs.close();
            rs = undefined;
        }, 2000);
    },
    receiveHelper,
    chain_status,
    file_tx_helper,
    wallet_helper,
    pay,
    sync
};

export default bitgrin;