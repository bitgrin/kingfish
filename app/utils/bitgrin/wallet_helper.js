import bitgrin from '../bitgrin';
import fs from 'fs';
import path from 'path';
const {spawn} = require('child_process');

let is_prompting_for_password = false;
let _wallet_password;
let password_handlers = [];

const wallet_helper = {
    writing_down_recovery_phrase: false,
    set_pass: (t_pass, successCb) => {
        // Check that the password works
        wallet_helper.password_valid(t_pass, (valid) => {
            if(valid) {
                successCb(true);
                _wallet_password = t_pass;
                for(let h_idx=0; h_idx<password_handlers.length; h_idx++) {
                    let handler = password_handlers[h_idx];
                    handler(_wallet_password);
                }
                is_prompting_for_password = false;
                bitgrin.set_readiness(bitgrin.READY_LEVELS.READY);
            }
            else {
                successCb(false);
            }
        });
    },
    password_valid: (pass, cb) => {
        let info_str = `${bitgrin.bg_wallet_bin_path} -p="${pass}" info`;
        let child_process = spawn(info_str, {shell: true});
        child_process.on('exit', function (code) {
            console.log(`EXIT WITH CODE: ${code}`);
            if(code != 0) {
                cb(false);
            }
            else {
                cb(true);
            }
        });
    },
    wallet_pass: async () => {
        if(typeof(_wallet_password) != 'undefined') {
            return new Promise((resolve) => {
                resolve(_wallet_password);
            });
        }
        if(is_prompting_for_password) {
            // Already was prompting, wait for the existing prompt to finish
            bitgrin.set_readiness(bitgrin.READY_LEVELS.AWAITING_PASSWORD);
            return new Promise((resolve, reject) => {
                let handler = (pass) => {
                    if(typeof(pass) != 'undefined') {
                        resolve(pass);
                    }
                    else {
                        reject("No password supplied");
                    }
                }
                password_handlers.push(handler);
            });
        }
        is_prompting_for_password = true;
        
            // Listen for password to be provided
            // window.password_listener = await async ((r_pass) => {
            // });
            // return new Promise((resolve, reject) => {
            /*prompt({
                title: 'Wallet Password Required',
                label: 'Password:',
                value: '',
                inputAttrs: {
                    type: 'password'
                }
            })
            .then((r) => {
                if(r === null) {
                    console.log('user cancelled');
                } else {
                    _wallet_password = r;
                }
                for(let h_idx=0; h_idx<password_handlers.length; h_idx++) {
                    let handler = password_handlers[h_idx];
                    handler(_wallet_password);
                }
                is_prompting_for_password = false;
            })
            .catch((e) => {
                console.log(e);
                reject("Error occurred retreiving password from prompt.");
            });*/
    },
    wallet_ready: () => {
        return !wallet_helper.writing_down_recovery_phrase && wallet_helper.wallet_seed_file_exists();
    },
    get_wallet_seed_path: () => {
        let wallet_cfg = bitgrin.get_wallet_config_sync();
        let wallet_data_directory = cfg.wallet.data_file_directory;
        if(typeof(wallet_data_directory) == 'undefined') {
            let iPath = path.join(bitgrin.bitgrin_main_path(), 'bg_wallet_data/wallet.seed');
            console.log(iPath);
            resolve(iPath);
        }
        else {
            console.log(wallet_data_directory);
            resolve(path.join(wallet_data_directory, 'bg_wallet_data/wallet.seed'));
        }
    },
    get_wallet_seed_path: () => {
        return path.join(bitgrin.bitgrin_main_path(), 'bg_wallet_data/wallet.seed');
    },
    wallet_seed_file_exists: () => {
        return fs.existsSync(wallet_helper.get_wallet_seed_path());
    },
    recover_wallet: (phrase, pass, cb) => {
        // bitgrin.exe wallet recover --phrase="word list here"
        // bitgrin-wallet.exe init -r -p "password" -m "word1....word32"
        let cmd_str = `${bitgrin.bg_wallet_bin_path} init -r -p "${pass}" -m "${phrase}"`;
        let child_process = spawn(cmd_str, {shell: true});
        child_process.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        child_process.stderr.on('data', function (data) {
            console.log(data.toString());
        });
        child_process.on('exit', function (code) {
            console.log(`EXIT WITH CODE: ${code}`);
            if(code != 0) {
                cb(false);
            }
            else {
                cb(true);
            }
        });
    },
    create_new_wallet: (pass, cb) => {
        // bitgrin wallet -p=password init
        let info_str = `${bitgrin.bg_wallet_bin_path} -p="${pass}" init`;
        let child_process = spawn(info_str, {shell: true});
        child_process.stdout.on('data', function (data) {
            console.log(data.toString());
            window.freeze_create_new_wallet_logs = false;
            if(data.toString().includes("Wallet seed file exists")) {
                window.freeze_create_new_wallet_logs = true;
                cb(undefined, "Wallet already exists. Please delete your current wallet_data or use the AUTHENTICATE tab to proceed.")
                return;
            }
            // TODO: dont parse stdout....
            if(data.includes("Please back-up these words in a non-digital format.")){
                var wordSeed = data.toString();
                wordSeed = wordSeed.replace("Your recovery phrase is:","");
                wordSeed = wordSeed.replace("Please back-up these words in a non-digital format.","");
                
                wordSeed = wordSeed.replace(/(\r\n|\n|\r)/gm, "");
                wordSeed = wordSeed.replace("wallet.seed","wallet.seed ==   ");
                var wordSeedWithLog = wordSeed;
                var wordSeedWithoutLog = wordSeedWithLog.substring(wordSeedWithLog.indexOf("==")+1);
                wordSeedWithoutLog = wordSeedWithoutLog.trim();
                wordSeedWithoutLog = wordSeedWithoutLog.replace("= ","");
                cb(wordSeedWithoutLog, '');
            }
        });
        child_process.on('exit', function (code) {
            if(window.freeze_create_new_wallet_logs) {
                return;
            }
            console.log(`EXIT WITH CODE: ${code}`);
            if(code != 0) {
                console.log(cb);
                cb(undefined, `Exited with code ${code}`);
            }
        });
    },
};

export default wallet_helper;