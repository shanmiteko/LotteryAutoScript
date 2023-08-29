const assert = require('assert');
const bili_client = require("../lib/net/bili");
const util = require('./util');
const { parseDynamicCard } = require('../lib/core/searcher');

(async () => {
    assert.notEqual(await bili_client.getMyinfo(), null);

    await util.par_run([0, 3], [
        // 0
        async () => {
            assert.equal((await bili_client.getTopRcmd()).length, 10)
        },
        // 1
        async () => {
            assert.equal(await bili_client.sendChat(
                parseDynamicCard(await bili_client.getOneDynamicByDyid("692193323569381399")).rid_str,
                "test",
                11),
                7
            )
        },
        // 2
        async () => {
            assert.equal(await bili_client.sendChat(
                parseDynamicCard(await bili_client.getOneDynamicByDyid("11229466874154064")).rid_str,
                "test",
                1),
                3
            )
        },
        // 3
        async () => {
            assert.notEqual((await bili_client.searchArticlesByKeyword("专栏")).length, 0)
        },
        // 4
        async () => {
            assert.notEqual(await bili_client.sendChat("703886913053917267", "t", 17), 1)
        },
        // 5
        async () => {
            assert(!await bili_client.createDynamic("1"))
        },
        // 6
        async () => {
            assert.equal(await bili_client.autolike("761391835139538967"), 4)
        },
        // 7
        async () => {
            assert(await bili_client.rmDynamic("835102428771647513"))
        },
    ])

    console.log("api.test ... ok!");
})()