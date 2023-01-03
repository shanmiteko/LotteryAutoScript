const assert = require('assert');
const bili_client = require("../lib/net/bili");
const searcher = require("../lib/core/searcher");
const util = require('./util');

(async () => {
    assert(await bili_client.getMyinfo());

    await util.par_run([0, 1, 2], [
        async () => {
            let info = await bili_client.getOneDynamicByDyid("728424890210713624");
            assert(searcher.parseDynamicCard(info).is_charge_lottery);
        },
        async () => {
            let info = await bili_client.getOneDynamicByDyid("728455586333589522");
            assert(searcher.parseDynamicCard(info).origin_is_charge_lottery);
        },
        async () => {
            let card = searcher.parseDynamicCard(await bili_client.getOneDynamicByDyid("746824225190314008"));
            let chats = await bili_client.getChat(card.rid_str, card.chat_type)
            assert(chats.length > 0 && typeof chats[0] == "string")
        },
    ])




    console.log("dynamic_card.test ... ok!");
})()