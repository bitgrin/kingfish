import bitgrin from '../bitgrin';
import fs from 'fs';
import path from 'path';
const crypto = require('crypto');
const {spawn} = require('child_process');

const ENCRYPTION_KEY = 'AFg25*n7qzt0UzkN#yNIeSLwDc@JW0X1'; //process.env.ENCRYPTION_KEY; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

const wallet_helper = {
    writing_down_recovery_phrase: false,
    wallet_ready: () => {
        return !wallet_helper.writing_down_recovery_phrase && wallet_helper.wallet_seed_file_exists() && wallet_helper.wallet_password_redux_stored();
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
    wallet_password_redux_stored: () => {
        const state = bitgrin.get_store().getState();
        return (typeof(state.settings.walletPassword) != 'undefined');
    },
    wallet_pass: () => {
        const state = bitgrin.get_store().getState();
        return wallet_helper.decrypt_str(state.settings.walletPassword);
    },
    wallet_seed_file_exists: () => {
        return fs.existsSync(wallet_helper.get_wallet_seed_path());
    },
    encrypt_str: (text) => {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    },
    decrypt_str: (text) => {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString();
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
    validate_seed_password: (pass, cb) => {
        // bitgrin wallet account
        let info_str = `${bitgrin.bg_wallet_bin_path} -p="${pass}" account`;
        let child_process = spawn(info_str, {shell: true});
        child_process.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        child_process.stderr.on('data', function (data) {
            console.log(data.toString());
        });
        child_process.on('exit', function (code) {
            console.log(`EXIT WITH CODE: ${code}`);
            if(code == 0) {
                cb(true);
            }
            else {
                cb(false);
            }
        });
    },
};

export default wallet_helper;