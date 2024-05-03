const assert = require('assert');
const bili_client = require("../lib/net/bili");
const util = require('./util');

(async () => {
    await util.par_run([], [
        // 0
        async () => {
            let info = await bili_client.getOneArticleByCv(22112353);
            let short_ids = [...new Set(info.match(/(?<=b23.tv\/)[a-zA-Z0-9]{7}/g) || [])];
            assert.equal((await Promise.all(short_ids.map(bili_client.shortDynamicIdToDyid)))[0], "767357823884460033");
        },
    ])
    console.log("article.test ... ok!");
})()