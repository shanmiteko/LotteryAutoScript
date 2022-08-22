const assert = require('assert');
const bili_client = require("../lib/net/bili");
const util = require('./util');

(async () => {
    assert(await bili_client.getMyinfo());

    await util.par_run([
        async () => {
            assert.equal((await bili_client.getTopRcmd()).length, 10)
        },
        async () => {
            assert.equal(await bili_client.sendChat(
                (await bili_client.getOneDynamicByDyid("692193323569381399")).desc.rid,
                "test",
                11),
                7
            )
        },
        async () => {
            assert.equal(await bili_client.sendChat(
                (await bili_client.getOneDynamicByDyid("11229466874154064")).desc.rid,
                "test",
                1),
                3
            )
        }
    ])

    console.log("api.test ... ok!");
})()