const { log, delay, infiniteNumber, retryfn } = require("./utils");
const bili = require("./net/bili");
const { Searcher } = require("./core/searcher");
const global_var = require('./data/global_var');
const config = require("./data/config");

/**
 * 获取关注分区里的uid
 * @returns { Promise<number[]> }
 */
async function getFollowList() {
    const
        { clear_partition, clear_white_list, get_partition_wait } = config,
        tagid = await bili.checkMyPartition(clear_partition);
    let rmup = [];
    if (typeof tagid === 'undefined') {
        log.info('获取关注列表', '未能成功获取关注分区id');
        return rmup
    }
    for (let index = 1; index < 100; index++) {
        const uids = await bili.getPartitionUID(tagid, index);
        await delay(get_partition_wait);
        if (!uids.length) break;
        rmup.push(...uids)
    }
    return clear_white_list.length
        ? rmup.filter(uid => clear_white_list.split(',').indexOf(String(uid)) === -1)
        : rmup;
}

/**
 * 清理动态和关注
 */
async function clear() {
    const { search_wait, clear_white_list, clear_max_day, clear_quick_remove_attention, clear_remove_dynamic, clear_remove_attention, clear_remove_delay, clear_dynamic_type } = config;
    let success = true;
    const uid_list = await getFollowList();
    if (!uid_list.length) {
        log.info('清理关注', `关注为空`)
    } else {
        log.info('清理关注', `共有${uid_list.length}个关注`)
    }
    if (clear_quick_remove_attention) {
        log.info('清理关注', '进入只清理关注模式')
        /* 专清关注 */
        for (const [index, uid] of uid_list.entries()) {
            log.info('清理关注', `(${index}) (${uid})`)
            /* 取消关注 */
            if (await retryfn(3, [false], () => bili.cancelAttention(uid))) {
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
            MY_UID = Number(global_var.get('myUID'));

        let next_offset = '0',
            before_separate = [];

        for (const page of infiniteNumber()) {
            log.info('清理动态', `开始读取第${page + 1}页`);
            const { allModifyDynamicResArray, offset } = (await retryfn(
                3,
                [null],
                () => Searcher.checkAllDynamic(MY_UID, 1, search_wait, next_offset)
            )) || { allModifyDynamicResArray: [], offset: '0' };
            next_offset = offset;
            for (const [index, dyinfo] of allModifyDynamicResArray.entries()) {
                log.info('清理动态', `第${page + 1}页中的第${index + 1}个动态`)
                const { type, dynamic_id, create_time, origin_uid } = dyinfo || {};
                if (typeof type !== 'undefined'
                    && clear_dynamic_type instanceof Array
                    ? clear_dynamic_type.includes(type)
                    : clear_dynamic_type === type
                ) {
                    const days_ago = (Now - create_time) / 86400;

                    if (days_ago > clear_max_day) {
                        log.debug('清理动态', `当前UID保护列表:\n${before_separate.join(',')}\n`)
                        /* 移除动态 */
                        if (dynamic_id
                            && clear_remove_dynamic
                            && !(new RegExp(dynamic_id).test(clear_white_list))) {
                            success = await retryfn(3, [false], () => bili.rmDynamic(dynamic_id))
                        }

                        /* 取消关注 */
                        if (origin_uid
                            && origin_uid !== MY_UID
                            && clear_remove_attention
                            && before_separate.indexOf(origin_uid) === -1
                            && uid_list.indexOf(origin_uid) > -1) {
                            success = await retryfn(3, [false], () => bili.cancelAttention(origin_uid))
                        }

                        if (!success) {
                            log.error("清理失败", "出现错误")
                            break
                        }
                        /* 延时 */
                        await delay(clear_remove_delay);
                    } else {
                        log.info('清理动态', `已设置跳过${clear_max_day}天 当前动态(${dynamic_id})发布时间: ${~~days_ago}天前`)

                        if (origin_uid) {
                            log.info('清理动态', `储存用户(${origin_uid})防止误删`)
                            before_separate.push(origin_uid)
                        } else {
                            log.info('清理动态', `非转发动态`)
                        }
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
