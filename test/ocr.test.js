const assert = require('assert');
const bili_client = require("../lib/net/bili");
const util = require('./util');
const { parseDynamicCard } = require('../lib/core/searcher');

(async () => {
    await util.par_run([], [
        // 0
        async () => {
            assert(await bili_client.getMyinfo());

            const rid = parseDynamicCard(await bili_client.getOneDynamicByDyid("551416252543796684")).rid_str;

            for (let index = 0; index < 100; index++) {
                console.log(index);
                await bili_client.sendChatWithOcr(
                    rid,
                    Date.now().toString(),
                    17,
                )
            }
        },]);
})()
