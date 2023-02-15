const assert = require('assert');
const bili_client = require("../lib/net/bili");
const searcher = require("../lib/core/searcher");
const util = require('./util');

(async () => {
    await util.par_run([0, 1, 2, 3, 4, 5], [
        // 0
        async () => {
            let info = await bili_client.getOneDynamicByDyid("728424890210713624");
            assert(searcher.parseDynamicCard(info).is_charge_lottery);
        },
        // 1
        async () => {
            let info = await bili_client.getOneDynamicByDyid("728455586333589522");
            assert(searcher.parseDynamicCard(info).origin_is_charge_lottery);
        },
        // 2
        async () => {
            let card = searcher.parseDynamicCard(await bili_client.getOneDynamicByDyid("746824225190314008"));
            let chats = await bili_client.getChat(card.rid_str, card.chat_type)
            assert(chats.length > 0 && typeof chats[0][0] == "string")
        },
        // 3
        async () => {
            let card = searcher.parseDynamicCard(await bili_client.getOneDynamicByDyid("747169355882561625"));
            assert(card.chat_type == 11)
            card = searcher.parseDynamicCard(await bili_client.getOneDynamicByDyid("747441158580338693"));
            assert(card.chat_type == 17)
            assert(card.origin_chat_type == 11)
        },
        // 4
        async () => {
            assert.equal(await bili_client.getOneDynamicByDyid("111111111111111111"), undefined);
            assert.notEqual(await bili_client.getOneDynamicByDyid("746824225190314008"), undefined);
            assert.equal(await bili_client.getOneDynamicByDyid("761475750233636886"), undefined);
        },
        // 5
        async () => {
            let card = searcher.parseDynamicCard(await bili_client.getOneDynamicByDyid("762591475338838053"));
            let chats = await bili_client.getChat(card.rid_str, card.chat_type)
            assert.equal(chats.length, 19)
            card = searcher.parseDynamicCard(await bili_client.getOneDynamicByDyid("762502724122050647"));
            chats = await bili_client.getChat(card.rid_str, card.chat_type)
            assert.equal(chats.filter(it => it[0] === '六的月').length, 0)
        },
    ])

    console.log("dynamic_card.test ... ok!");
})()