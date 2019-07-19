import fs from 'fs';
import path from 'path';
import bitgrin from '../bitgrin';

const pay = {
    tmp_slate_path: () => {
        return path.join(bitgrin.get_pending_slate_path(), "slate.tx");
    },
    request_payment: (login, password, user_id_endpoint, endpoint, callback) => {
        if(bitgrin.readiness == bitgrin.READY_LEVELS.SHUTDOWN || bitgrin.readiness == bitgrin.READY_LEVELS.SHUTTING_DOWN) {
            callback(false, "Wallet not ready");
            return;
        }
        // Make the temporary slate path dir
        // get_pending_slate_path
        if(!fs.existsSync(bitgrin.get_pending_slate_path())) {
            fs.mkdirSync(bitgrin.get_pending_slate_path());
        }

        // Get user id
        const url_userid = `${user_id_endpoint}`;
        const headers_user_id = new Headers({
            "Authorization": 'Basic ' + Buffer.from(login + ":" + password).toString('base64')
        })
        fetch(url_userid, {
            headers: headers_user_id,
            method: 'get'
        }).then(response => {
            if (!response.ok) {
                callback(false, "Error authenticating user");
            }
            else {
                console.log('ok response');
                response.text().then((txt) => {
                    let resp = JSON.parse(txt);
                    let user_data = resp;
                    window.resp = user_data;
                    if(typeof(user_data.id) != 'undefined' &&user_data.id != null) {
                        user_data.login = login;
                        user_data.password = password;
                        user_data.endpoint = endpoint;
                        const return_url = `https://api.pool.bitgrin.io/pool/payment/submit_tx_slate/${user_data.id}`;
                        bitgrin.pay.request_slate(user_data, callback);
                    }
                });
            }
        })
    },
    request_slate: (user_data, callback /* success, msg */) => {
        const headers = new Headers({
            "Authorization": 'Basic ' + Buffer.from(user_data.login + ":" + user_data.password).toString('base64')
        })

        const url = `${user_data.endpoint}${user_data.id}`;
        console.log(url);
        fetch(url, {
            headers: headers,
            method: 'post'
        }).then(response => {
            if (!response.ok) {
                response.text().then((error_txt) => {
                    callback(false, `Error code ${error_txt}`);
                }).catch(() => {
                    callback(false, `Error code ${response.status}`);
                });
                return;
            }
            else {
                response.text().then((slate_txt) => {
                    fs.writeFile(bitgrin.pay.tmp_slate_path(), slate_txt, function(err) {
                        if(err) {
                            callback(false, slate_txt);
                            console.log(err);
                            return;
                        }
                        console.log("The file was saved!");
                        bitgrin.pay.sign_slate(bitgrin.pay.tmp_slate_path(), user_data, callback);
                    }); 
                })
            }
        });
    },
    sign_slate: (slate_path, user_data, callback) => {
        bitgrin.perform_file_receive(slate_path, (log) => {
            console.log(log);
        }, (exit_code) => {
            if(exit_code == 0) {
                // Success
                const responseExt = '.tx.response';
                const txFileName = path.basename(slate_path, path.extname(slate_path)) + responseExt;
                const responseFileName = path.join(path.dirname(slate_path), txFileName);
                bitgrin.pay.return_signed_slate(responseFileName, user_data, callback);
            }
            else {
                callback(false, `Error signing response tx`);
            }
        });
    },
    return_signed_slate: (response_path, user_data, callback) => {
        let slate_data = fs.readFileSync(response_path);
        console.log(slate_data);
        console.log(user_data.login);
        console.log(user_data.password);
        const headers = new Headers({
            "Authorization": 'Basic ' + Buffer.from(user_data.login + ":" + user_data.password).toString('base64')
        })
        const return_url = `https://api.pool.bitgrin.io/pool/payment/submit_tx_slate/${user_data.id}`;
        fetch(return_url, {
            headers: headers,
            method: 'post',
            body: slate_data
        }).then(response => {
            if (!response.ok) {
                callback(false, `Error returning signed tx slate ${response.status}`);
            }
            response.text().then((txt) => {
                console.log(txt);
                callback(true, txt);
            })
        });
    }
}

export default pay;