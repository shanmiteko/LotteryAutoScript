const Base = require("./Base");
const { checkMyPartition } = require("./BiliAPI");
const BiliAPI = require("./BiliAPI");
const Public = require("./Public");
const GlobalVar = require('./GlobalVar.json');
const { followWhiteList } = require("./config");

let offset = '0';

/**天 */
const separate = 60;

/**
 * 获取关注分区里的uid
 * @returns { Promise<number[]> }
 */
async function getFollowList() {
    const tagid = await checkMyPartition();
    if (tagid === 0) { Base.tooltip.log('未能成功获取关注分区id'); return }
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
    return rmup;
}

/**
 * 清理动态和关注
 */
async function clear() {
    let success = true;
    const uid_list = await getFollowList();
    const now = Date.now() / 1000;
    let before_separate = [];
    for (let index = 0; index < 1000; index++) {
        const { allModifyDynamicResArray, offset: _offset } = await Public.prototype.checkAllDynamic(GlobalVar.myUID, 1, 5 * 1000, offset);
        offset = _offset;
        Base.tooltip.log(`开始读取第${index + 1}页(12条)`);
        for (let index = 0; index < allModifyDynamicResArray.length; index++) {
            const res = allModifyDynamicResArray[index];
            const { type, dynamic_id, createtime } = res;
            if (type === 1) {
                const { origin_uid } = res;
                if ((now - createtime) > 86400 * separate) {
                    success = await BiliAPI.rmDynamic(dynamic_id);
                    if (before_separate.indexOf(origin_uid) === -1
                        && uid_list.indexOf(origin_uid) > -1) {
                        success = await BiliAPI.cancelAttention(origin_uid);
                    }
                    if (!success) break;
                } else {
                    before_separate.push(origin_uid)
                }
            }
            await Base.delay(8e3);
        }
        Base.tooltip.log(`第${index}页中的转发动态全部删除成功`)
        if (offset === '0' || !success) break;
    }
}


module.exports = { clear }