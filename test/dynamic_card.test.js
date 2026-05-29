//const assert = require('assert');
const bili_client = require('../lib/net/bili');
const searcher = require('../lib/core/searcher');
const util = require('./util');

(async () => {
    await util.par_run([0], [
        // 0
        async () => {
            let info = await bili_client.getOneDynamicByDyid('1207028214165143570');
            let card = searcher.parseDynamicCard(info);
            console.log(JSON.stringify(card, null, 4));
        },
    ]);

    console.log('dynamic_card.test ... ok!');
})();
