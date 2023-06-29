const util = require('./util');
const crypto = require('crypto');
const { send } = require('../lib/net/http');

(async () => {
    await util.par_run([0], [
        // 0
        async () => {
            let timestamp = parseInt(new Date().getTime() / 1000);
            let orderno = process.env["XMDL_ORDERNNO"];
            let secret = process.env["XMDL_SECRET"];

            if (orderno && secret) {
                let txt = 'orderno=' + orderno + ',secret=' + secret + ',timestamp=' + timestamp;
                let md5 = crypto.createHash('md5');
                let sign = md5.update(txt).digest('hex').toUpperCase();

                console.log(await new Promise((resolve) => {
                    send({
                        url: "https://api.bilibili.com/client_info",
                        proxy: {
                            url: "http://dtan.xiongmaodaili.com:8088",
                            auth_headers: [
                                ["Proxy-Authorization", 'sign=' + sign + '&orderno=' + orderno + "&timestamp=" + timestamp]
                            ]
                        },
                        config: {
                            retry: false
                        },
                        success: (res) => { resolve(JSON.parse(res.body)) },
                        failure: resolve
                    })
                }));
                console.log("proxy.test ... ok!");
            }
        },
    ])
})()