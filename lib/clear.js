const Base = require("./Base");
const BiliAPI = require("./BiliAPI");
const Public = require("./Public");
const GlobalVar = require('./GlobalVar');
const { followWhiteList } = require("./config");
const config = require("./config");

/**动态偏移量 */
let offset = '0';

/**
 * 获取关注分区里的uid
 * @returns { Promise<number[]> }
 */
async function getFollowList() {
    const tagid = await BiliAPI.checkMyPartition(config.clear_partition);
    if (typeof tagid === 'undefined') { Base.tooltip.log('未能成功获取关注分区id'); return }
    let rmup = [];
    for (let index = 1; index < 42; index++) {
        const uids = await BiliAPI.getPartitionUID(tagid, index);
        await Base.delay(2e3);
        if (!uids.length) break;
        rmup.push(...uids)
    }
    return followWhiteList.length
        ? rmup.filter(uid => followWhiteList.split(',').indexOf(String(uid)) === -1)
        : rmup;
}

/**
 * 清理动态和关注
 */
async function clear() {
    const { clear_max_day, clear_remove_dynamic, clear_remove_attention, clear_remove_delay, clear_dynamic_type } = config;
    let success = true;
    const uid_list = await getFollowList();
    if (!clear_remove_dynamic && clear_remove_attention) {
        /* 专清关注 */
        for (let index = 0; index < uid_list.length; index++) {
            const uid = uid_list[index];
            /* 取消关注 */
            success = await BiliAPI.cancelAttention(uid);
            /* 延时 */
            await Base.delay(clear_remove_delay);

            if (!success) break;
        }
    } else {
        const now = Date.now() / 1000;
        let before_separate = [];
        const MY_UID = Number(GlobalVar.get('myUID'));
        for (let index = 0; ; index++) {
            const { allModifyDynamicResArray, offset: _offset } = await Public.prototype.checkAllDynamic(GlobalVar.get("myUID"), 1, 5 * 1000, offset);
            offset = _offset;
            Base.tooltip.log(`开始读取第${index + 1}页(12条)`);
            for (let index = 0; index < allModifyDynamicResArray.length; index++) {
                const res = allModifyDynamicResArray[index];
                const { type, dynamic_id, createtime } = res;
                if (type === clear_dynamic_type) {
                    const { origin_uid } = res;
                    if ((now - createtime) > 86400 * clear_max_day) {
                        /* 移除动态 */
                        if (dynamic_id
                            && clear_remove_dynamic) {
                            success = await BiliAPI.rmDynamic(dynamic_id)
                        }

                        /* 取消关注 */
                        if (origin_uid
                            && origin_uid !== MY_UID
                            && clear_remove_attention
                            && before_separate.indexOf(origin_uid) === -1
                            && uid_list.indexOf(origin_uid) > -1) {
                            success = await BiliAPI.cancelAttention(origin_uid);
                        }

                        /* 延时 */
                        await Base.delay(clear_remove_delay);

                        if (!success) break;
                    } else {
                        before_separate.push(origin_uid)
                    }
                }
            }
            Base.tooltip.log(`第${index}页中的转发动态与关注全部处理成功`)
            if (offset === '0' || !success) break;
        }
    }
    return
}


module.exports = { clear }