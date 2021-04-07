const Base = require("./Base");
const BiliAPI = require("./BiliAPI");
const { trigger } = require("./GithubAPI");
const Public = require("./Public");
const GlobalVar = require('./GlobalVar.json');
const { followWhiteList } = require("./config");
const config = require("./config");

/** Github运行限制时间*/
const MAX_TIME = 6 * 60 * 60 * 1000 - 6 * 60 * 1000;
/**动态偏移量 */
let offset = '0';

/**天 */
const separate = 60;

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
        const cancelFollowUIDList = followWhiteList.length ?
            uids.filter(uid => followWhiteList.split(',').indexOf(String(uid)) === -1) : uids;
        if (cancelFollowUIDList.length) {
            rmup.push(...cancelFollowUIDList);
        } else { break }
    }
    return rmup;
}

/**
 * 清理动态和关注
 */
async function clear() {
    if (!process.env.LOCALLAUNCH) {
        setTimeout(() => {
            Base.tooltip.log('运行时间超过Actions上限 - 6小时');
            Base.tooltip.log('尝试再次触发clear 并中止此任务')
            trigger('clear.yml').then(() => {
                process.exit(0);
            })
        }, MAX_TIME);
    }
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
                    await Base.delay(8e3);
                    if (!success) break;
                } else {
                    before_separate.push(origin_uid)
                }
            }
        }
        Base.tooltip.log(`第${index}页中的转发动态全部处理成功`)
        if (offset === '0' || !success) break;
    }
    return
}


module.exports = { clear }