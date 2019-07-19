const dns = require('dns');
const os = require('os');
const publicIp = require('public-ip');

const iphelper = {
    get_ips: (cb) => {
        dns.lookup(os.hostname(), (err, add, fam) => {
            publicIp.v4().then((ip) => {
                cb({local: add, remotev4: ip});
            })
            publicIp.v6().then((ip) => {
                cb({local: add, remotev6: ip});
            })
        })
    }
}

export default iphelper;