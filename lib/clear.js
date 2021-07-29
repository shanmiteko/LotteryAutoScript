const { log, delay, infiniteNumber } = require("./Util");
const BiliAPI = require("./BiliAPI");
const Public = require("./Public");
const GlobalVar = require('./GlobalVar');
const config = require("./config");

/**
 * 获取关注分区里的uid
 * @returns { Promise<number[]> }
 */
async function getFollowList() {
    const tagid = await BiliAPI.checkMyPartition(config.clear_partition);
    if (typeof tagid === 'undefined') {
        log.info('获取关注列表', '未能成功获取关注分区id');
        return
    }
    let rmup = [];
    for (let index = 1; index < 42; index++) {
        const uids = await BiliAPI.getPartitionUID(tagid, index);
        await delay(2e3);
        if (!uids.length) break;
        rmup.push(...uids)
    }
    return config.clear_white_list.length
        ? rmup.filter(uid => config.clear_white_list.split(',').indexOf(String(uid)) === -1)
        : rmup;
}

/**
 * 清理动态和关注
 */
async function clear() {
    const { clear_white_list, clear_max_day, clear_remove_dynamic, clear_remove_attention, clear_remove_delay, clear_dynamic_type } = config;
    let success = true;
    const uid_list = await getFollowList();
    if (!uid_list.length) {
        log.info('清理关注', `关注为空`)
    } else {
        log.info('清理关注', `共有${uid_list.length}个关注`)
    }
    if (!clear_remove_dynamic && clear_remove_attention) {
        log.info('清理关注', '进入只清理关注模式')
        /* 专清关注 */
        for (const [index, uid] of uid_list.entries()) {
            log.info('清理关注', `(${index}) (${uid})`)
            /* 取消关注 */
            if (await BiliAPI.cancelAttention(uid)) {
                log.info('清理关注', '成功')
            } else {
                log.error('清理关注', '失败')
                break
            }
            /* 延时 */
            await delay(clear_remove_delay);
        }
    } else {
        const
            Now = Date.now() / 1000,
            MY_UID = Number(GlobalVar.get('myUID'));

        let next_offset = '0',
            before_separate = [];

        for (const page of infiniteNumber()) {
            log.info('清理动态', `开始读取第${page + 1}页`);
            const { allModifyDynamicResArray, offset } = await Public.prototype.checkAllDynamic(MY_UID, 1, 5 * 1000, next_offset);
            next_offset = offset;
            for (const [index, dyinfo] of allModifyDynamicResArray.entries()) {
                log.info('清理动态', `第${page + 1}页中的第${index + 1}个动态`)
                const { type, dynamic_id, createtime } = dyinfo || {};
                if (type === clear_dynamic_type) {
                    const
                        { origin_uid } = dyinfo,
                        days_ago = (Now - createtime) / 86400;

                    if (days_ago > clear_max_day) {
                        /* 移除动态 */
                        if (dynamic_id
                            && clear_remove_dynamic
                            && !(new RegExp(dynamic_id).test(clear_white_list))) {
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

                        if (!success) break;
                        /* 延时 */
                        await delay(clear_remove_delay);
                    } else {
                        log.info('清理动态', `已设置跳过${clear_max_day}天 当前动态发布时间: ${~~days_ago}天前`)
                        log.info('清理动态', `储存用户(${origin_uid})防止误删`)
                        before_separate.push(origin_uid)
                    }
                } else {
                    log.info('清理动态', `此动态类型为${type} != 要清理的动态类型${clear_dynamic_type}`)
                }
            }
            log.info('清理动态', `第${page + 1}页(${allModifyDynamicResArray.length})中的转发动态与关注全部处理成功`)
            if (next_offset === '0' || !success) break;
        }
    }
    return
}


module.exports = { clear }