const assert = require('assert');
const bili_client = require("../lib/net/bili");
const util = require('./util');

(async () => {
    assert(await bili_client.getMyinfo());

    await util.par_run([0, 1, 2, 3, 4], [
        // 0
        async () => {
            assert.equal((await bili_client.getTopRcmd()).length, 10)
        },
        // 1
        async () => {
            assert.equal(await bili_client.sendChat(
                (await bili_client.getOneDynamicByDyid("692193323569381399")).desc.rid,
                "test",
                11),
                7
            )
        },
        // 2
        async () => {
            assert.equal(await bili_client.sendChat(
                (await bili_client.getOneDynamicByDyid("11229466874154064")).desc.rid,
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
        }
    ])

    console.log("api.test ... ok!");
})()