const os = require('os');
const path = require('path');
import fs from 'fs';
import bitgrin from '../bitgrin';

const bitgrin_header_data_pmmr = () => {
    return path.join(bitgrin.bitgrin_main_path() ,
	'bg_chain_data/header/header_head/pmmr_data.bin');
}
const bitgrin_sync_head_pmmr = () => {
    return path.join(bitgrin.bitgrin_main_path() ,
	'bg_chain_data/header/sync_head/pmmr_data.bin');
}

function getFilesizeInBytes(filename) {
	try {
		var stats = fs.statSync(filename)
		var fileSizeInBytes = stats["size"]
		return fileSizeInBytes
	}
	catch (e) {
        console.log(e);
		return -1;
	}
}

const sync = {
    state: () => {
        let hdsize = getFilesizeInBytes(bitgrin_header_data_pmmr());
        let shsize = getFilesizeInBytes(bitgrin_sync_head_pmmr());
        console.log(`get sync state ${bitgrin_header_data_pmmr()} ${hdsize}`)
        console.log(`get sync state ${bitgrin_sync_head_pmmr()} ${shsize}`)
        if(hdsize == -1 && shsize == -1) {
            return "Searching for peers...";
        }
        if(hdsize != 53) {
            // let per = (hdsize / 2584227 * 100).toFixed(0);
            return `Verifying rangeproofs... ${hdsize}`;
        }
        else {
            if(shsize == -1) {
                return "Connecting to peers...";
            }
            let per = (shsize / 10000000 * 100).toFixed(0);
            return `Getting headers ${per}%`;
        }
        return undefined;
    }
};

export default sync;