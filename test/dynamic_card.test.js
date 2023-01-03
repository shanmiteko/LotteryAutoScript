const assert = require('assert');
const bili_client = require("../lib/net/bili");
const searcher = require("../lib/core/searcher");

(async () => {
    assert(await bili_client.getMyinfo());

    let info = await bili_client.getOneDynamicByDyid("728424890210713624");

    assert(searcher.parseDynamicCard(info).is_charge_lottery);

    info = await bili_client.getOneDynamicByDyid("728455586333589522");

    assert(searcher.parseDynamicCard(info).origin_is_charge_lottery);

    console.log("dynamic_card.test ... ok!");
})()