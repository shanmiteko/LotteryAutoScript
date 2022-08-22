const assert = require('assert');
const bili_client = require("../lib/net/bili");

(async () => {
    assert(await bili_client.getMyinfo())
    assert.equal((await bili_client.getTopRcmd()).length, 10)
    console.log("api.test ... ok!");
})()