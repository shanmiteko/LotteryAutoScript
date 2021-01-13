const Base = require("./Base");
const { checkMyPartition } = require("./BiliAPI");
const BiliAPI = require("./BiliAPI");
const Public = require("./Public");
const GlobalVar = require('./GlobalVar.json');
const { clearDyid } = require("./MyStorage");

let offset = '0';
async function delDynamic() {
    for (let index = 0; index < 1000; index++) {
        const { allModifyDynamicResArray, offset: _offset } = await Public.prototype.checkAllDynamic(GlobalVar.myUID, 1, 5 * 1000, offset);
        offset = _offset;
        if (index < 2) {
            console.log(`跳过第${index + 1}页(12条)`);
        } else {
            console.log(`开始读取第${index + 1}页(12条)`);
            for (let index = 0; index < allModifyDynamicResArray.length; index++) {
                const res = allModifyDynamicResArray[index];
                const { type, dynamic_id } = res;
                if (type === 1) BiliAPI.rmDynamic(dynamic_id);
                await Base.delay(8 * 1000);
            }
            console.log(`第${index}页中的转发动态全部删除成功`)
        }
        if (offset === '0') break;
    }
}
async function unFollow() {
    const tagid = await checkMyPartition();
    if (tagid === 0) { console.log('未能成功获取关注分区id'); return }
    let rmup = [];
    for (let index = 1; index < 42; index++) {
        const uids = await BiliAPI.getPartitionUID(tagid, index);
        await Base.delay(5 * 1000);
        rmup.push(...uids);
        if (uids.length === 0) break;
    }
    for (let index = 0; index < rmup.length; index++) {
        const uid = rmup[index];
        BiliAPI.cancelAttention(uid);
        await Base.delay(8 * 1000);
    }
}


/**
 * 清理动态和关注
 */
async function clear() {
    await delDynamic();
    await unFollow();
    await clearDyid();
    return;
}

module.exports = { clear }