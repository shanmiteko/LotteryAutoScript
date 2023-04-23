const assert = require('assert');
const bili_client = require("../lib/net/bili");
const searcher = require("../lib/core/searcher");
const util = require('./util');

(async () => {
    await util.par_run([0], [
        // 0
        async () => {
            let info = await bili_client.getOneArticleByCv(22112353);
            console.log(info);
        },
    ])

    console.log("article.test ... ok!");
})()