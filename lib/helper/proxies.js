const { log } = require('../utils');
const crypto = require('crypto');

/**
 * [熊猫代理](http://www.xiongmaodaili.com)
 * @returns {import("../net/http").ProxyConfig}
 */
function xiongmaodaili() {
    log.info("熊猫代理", "开始")
    let timestamp = parseInt(new Date().getTime() / 1000);
    let orderno = process.env["XMDL_ORDERNNO"];
    let secret = process.env["XMDL_SECRET"];

    let txt = 'orderno=' + orderno + ',secret=' + secret + ',timestamp=' + timestamp;
    let md5 = crypto.createHash('md5');
    let sign = md5.update(txt).digest('hex').toUpperCase();

    return {
        url: "http://dtan.xiongmaodaili.com:8088",
        auth_headers: [
            ["Proxy-Authorization", 'sign=' + sign + '&orderno=' + orderno + "&timestamp=" + timestamp]
        ]
    }
}

module.exports = { xiongmaodaili }