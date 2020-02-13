import base64 from 'base-64';
import bitgrin from '../bitgrin';

const seed_chain_status_url = `https://mainseed.bitgrin.dev:8513/v1/status`;
const local_chain_status_url = `http://127.0.0.1:8513/v1/status`; // TODO: verify this is functional in v2, I can't imagine it is

const chain_status = {
    get_seed_tip: (cb) => {
        fetch(seed_chain_status_url).then((response) => {
            if (!response.ok) throw new Error(response.status);
            response.json().then((jsono) => {
                cb(jsono);
            })
        })
    },
    get_seed_height: (cb) => {
        chain_status.get_seed_tip((status) => {
            cb(status.tip.height)
        })
    },
    get_local_tip: (cb) => {
        bitgrin.get_api_secret((api_key) => {
            fetch(local_chain_status_url, {
                headers: new Headers({
                    "Authorization": `Basic ${base64.encode(`bitgrin:${api_key}`)}`
                }),
            }).then(response => {
                if (!response.ok) {
                    throw new Error(response.status);
                }
                response.json().then((jsono) => {
                    cb(jsono);
                });
            });
        });
    },
    get_local_height: (cb) => {
        chain_status.get_local_tip((status) => {
            cb(status.tip.height)
        })
    }
}

export default chain_status;