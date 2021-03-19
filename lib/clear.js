const Base = require("./Base");
const { checkMyPartition } = require("./BiliAPI");
const BiliAPI = require("./BiliAPI");
const Public = require("./Public");
const GlobalVar = require('./GlobalVar.json');
const { followWhiteList } = require("./config");

let offset = '0';
async function delDynamic () {
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
                if (type === 1) {
                    const success = await BiliAPI.rmDynamic(dynamic_id);
                    if (!success) return;
                }
                await Base.delay(8e3);
            }
            console.log(`第${index}页中的转发动态全部删除成功`)
        }
        if (offset === '0') break;
    }
}
async function unFollow () {
    const tagid = await checkMyPartition();
    if (tagid === 0) { console.log('未能成功获取关注分区id'); return }
    let rmup = [];
    for (let index = 1; index < 42; index++) {
        const uids = await BiliAPI.getPartitionUID(tagid, index);
        await Base.delay(5 * 1000);
        const cancelFollowUIDList = followWhiteList.length ?
            uids.filter(uid => followWhiteList.split(',').indexOf(String(uid)) === -1) : uids;
        if (cancelFollowUIDList.length) {
            rmup.push(...cancelFollowUIDList);
        } else {
            break;
        }
    }
    for (let index = 0; index < rmup.length; index++) {
        const uid = rmup[index];
        const success = await BiliAPI.cancelAttention(uid);
        if (!success) break;
        await Base.delay(8 * 1000);
    }
    return;
}


/**
 * 清理动态和关注
 */
async function clear () {
    await delDynamic();
    await unFollow();
    return;
}

module.exports = { clear }