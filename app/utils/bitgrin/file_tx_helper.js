const { dialog, app } = require('electron').remote;
const path = require('path');

const file_tx_helper = {
    save_send: (data) => {
        let blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
    },
    select_slate_save_location: (filename, cb) => {
        const options = {
            defaultPath: path.join(app.getPath('documents'), filename),
            filters: [{name: "BitGrin Transaction Slate", extensions: ["tx"]}]
        }
        dialog.showSaveDialog(null, options, (filename) => {
            if(typeof(filename) == 'undefined') {
                // Cancelled save
                cb(undefined);
            }
            else {
                // Save completed
                cb(filename);
            }
        });
    },
    select_slate_file_on_disk: (cb) => {
        dialog.showOpenDialog((filenames) => {
            if(typeof(filenames) == 'undefined') {
                // Cancelled open
                cb(undefined);
            }
            else {
                // Open completed
                cb(filenames[0]);
            }
        });
    }
}

export default file_tx_helper;