const { log, hasEnv, shuffle, getRandomOne, delay, try_for_each, retryfn } = require('../utils');
const { send } = require('../net/http');
const bili = require('../net/bili');
const { sendNotify } = require('../helper/notify');
const event_bus = require('../helper/event_bus');
const { randomDynamic } = require('../helper/randomDynamic')
const { Searcher } = require('./searcher');
const global_var = require("../data/global_var");
const config = require("../data/config");
const d_storage = require('../helper/d_storage');

/**
 * 监视器
 */
class Monitor extends Searcher {
    /**
     * @constructor
     * @param {[string, number | string]} lottery_param
     */
    constructor(lottery_param) {
        super();
        this.lottery_param = lottery_param
        this.tagid = config.partition_id; /* tagid初始化 */
        this.attentionList = ''; /* 转为字符串的所有关注的up主uid */
        this.LotteryInfoMap = new Map([
            ['UIDs', this.getLotteryInfoByUID.bind(this)],
            ['TAGs', this.getLotteryInfoByTag.bind(this)],
            ['Articles', this.getLotteryInfoByArticle.bind(this)],
            ['APIs', this.getLotteryInfoByAPI.bind(this)]
        ]);
    }
    /**
     * 初始化
     */
    async init() {
        if (config.model === '00') {
            event_bus.emit('Turn_off_the_Monitor', '已关闭所有转发行为')
            return
        }
        if (!this.tagid) {
            this.tagid = await bili.checkMyPartition() /* 检查关注分区 */
            if (!this.tagid) {
                event_bus.emit('Turn_off_the_Monitor', '分区获取失败')
                return
            }
        }
        /** 关注列表初始化 */
        this.attentionList = await bili.getAttentionList(global_var.get("myUID"));
        switch (await this.startLottery()) {
            case 0:
                event_bus.emit('Turn_on_the_Monitor')
                break;
            case 1001:
                event_bus.emit('Turn_off_the_Monitor', '评论失败')
                break;
            case 2001:
                event_bus.emit('Turn_off_the_Monitor', '关注出错')
                break;
            case 3001:
                event_bus.emit('Turn_off_the_Monitor', '分区移动出错')
                break;
            case 2004:
                log.warn('账号异常', `UID(${global_var.get('myUID')})异常号只会对部分UP出现关注异常`)
                if (!config.is_exception) {
                    await sendNotify('[动态抽奖]账号异常通知', `UID: ${global_var.get('myUID')}\n\n异常号只会对部分UP出现关注异常\n\n可在设置中令is_exception为true关闭此推送`)
                }
                config.is_exception = true;
                event_bus.emit('Turn_on_the_Monitor')
                break
            case 2005:
                log.warn('关注已达上限', `UID(${global_var.get('myUID')})关注已达上限,已临时进入只转已关注模式`)
                if (!config.is_outof_maxfollow) {
                    await sendNotify('[动态抽奖]关注已达上限', `UID: ${global_var.get('myUID')}\n\n关注已达上限,已临时进入只转已关注模式\n\n可在设置中令is_outof_maxfollow为true关闭此推送`)
                }
                config.is_outof_maxfollow = true;
                config.only_followed = true;
                event_bus.emit('Turn_on_the_Monitor')
                break
            case 5001:
                event_bus.emit('Turn_off_the_Monitor', '转发失败')
                break
            case 6001:
                event_bus.emit('Turn_off_the_Monitor', '获取开奖时间失败')
                break
            case 7001:
                event_bus.emit('Turn_off_the_Monitor', '获取关注数失败')
                break
            default:
                event_bus.emit('Turn_off_the_Monitor', '??? 未知错误')
                break;
        }
    }
    /**
     * 启动
     * @returns {Promise<number>}
     */
    async startLottery() {
        const allLottery = await this.filterLotteryInfo()
            , len = allLottery.length
            , { create_dy, create_dy_mode, wait, filter_wait } = config;

        log.info('筛选动态', `筛选完毕(${len})`);

        if (len) {
            let
                status = 0,
                is_exception = 0,
                is_outof_maxfollow = 0,
                relayed_nums = 0;
            for (const [index, lottery] of shuffle(allLottery).entries()) {
                let is_shutdown = false;
                if (
                    is_outof_maxfollow
                    && lottery.uid.length
                    && (new RegExp(lottery.uid.join('|'))).test(this.attentionList)
                ) {
                    log.info('过滤', `已关注(${lottery.uid.join(',')})`)
                    continue
                }

                if (lottery.isOfficialLottery) {
                    let { ts } = await bili.getLotteryNotice(lottery.dyid);
                    const ts_10 = Date.now() / 1000;
                    if (ts < 0) {
                        status = 6001
                        break;
                    }
                    if (ts < ts_10) {
                        log.info('过滤', '已过开奖时间')
                        d_storage.updateDyid(lottery.dyid)
                        await delay(filter_wait)
                        continue
                    }
                    if (ts > ts_10 + config.maxday * 86400) {
                        log.info('过滤', '超过指定开奖时间')
                        d_storage.updateDyid(lottery.dyid)
                        await delay(filter_wait)
                        continue
                    }
                } else if (lottery.uid[0]) {
                    const { minfollower } = config
                    if (minfollower > 0) {
                        const followerNum = await bili.getUserInfo(lottery.uid[0]);
                        if (followerNum < 0) {
                            status = 7001
                            break;
                        }
                        if (followerNum < minfollower) {
                            log.info('过滤', `粉丝数(${followerNum})小于指定数量`)
                            d_storage.updateDyid(lottery.dyid)
                            await delay(filter_wait)
                            continue
                        }
                    } else {
                        log.info('过滤', "不过滤粉丝数")
                    }
                }

                if (create_dy
                    && create_dy_mode instanceof Array
                    && index > 0
                    && index % getRandomOne(create_dy_mode[0]) === 0
                ) {
                    const number = getRandomOne(create_dy_mode[1]) || 0;
                    randomDynamic(number)
                }

                status = await this.go(lottery)
                switch (status) {
                    case 0:
                        relayed_nums += 1
                        break;
                    case 1002:
                    case 1003:
                    case 1004:
                    case 1005:
                    case 1006:
                    case 1007:
                    case 2002:
                    case 2003:
                    case 4001:
                    case 4002:
                    case 4003:
                    case 5002:
                    case 5003:
                    case 5004:
                        status = 0
                        break;
                    case 2004:
                        is_exception = 2004
                        break;
                    case 2005:
                        is_outof_maxfollow = 2005
                        break;
                    case 1001:
                    case 2001:
                    case 3001:
                    case 5001:
                        is_shutdown = true
                        break;
                }

                if (is_shutdown) break

                d_storage.updateDyid(lottery.dyid)

                await delay(wait * (Math.random() + 0.5));
            }
            log.info('抽奖', `本轮共转发${relayed_nums}条`);
            return is_exception
                || is_outof_maxfollow
                || status
        } else {
            log.info('抽奖', '无未转发抽奖');
            return 0
        }
    }

    /**
     * 抽奖配置
     * @typedef {object} LotteryOptions
     * @property {number[]} uid 用户标识
     * @property {string} dyid 动态标识
     * @property {boolean} isOfficialLottery 是否官方抽奖
     * @property {string} relay_chat 转发词
     * @property {string} ctrl 定位@
     * @property {string} [rid] 评论标识
     * @property {number} chat_type 评论类型
     * @property {string} [chat] 评论词
     */
    /**
     * @returns {Promise<LotteryOptions[]>}
     */
    async filterLotteryInfo() {
        const { lottery_param, LotteryInfoMap, attentionList } = this;
        /**
         * @type {import("./searcher").LotteryInfo[]}
         */
        let protoLotteryInfo = await LotteryInfoMap.get(lottery_param[0])(lottery_param[1]);

        if (protoLotteryInfo === null)
            return [];

        log.info('筛选动态', `开始筛选(${protoLotteryInfo.length})`);

        /** 所有抽奖信息 */
        let alllotteryinfo = [];
        const
            { check_if_duplicated, set_lottery_info_url, disable_reserve_lottery, sneaktower, key_words, model, chatmodel, chat: chats, relay: relays, block_dynamic_type, max_create_time, is_imitator, only_followed, at_users, blockword, blacklist, use_public_blacklist } = config,
            now_ts = Date.now() / 1000;

        /**
         * @type {Map<String, Boolean>}
         */
        let dyids_map = new Map();

        /**去重 */
        protoLotteryInfo = protoLotteryInfo.filter(({ dyid }) => {
            if (dyids_map.has(dyid)) {
                return false
            }
            dyids_map.set(dyid, false);
            return true
        });

        log.info('筛选动态', `去重后(${protoLotteryInfo.length})`);

        /**并发查询dyid */
        if (check_if_duplicated >= 1) {
            await Promise.all(
                [...dyids_map.keys()]
                    .map(it => d_storage
                        .searchDyid(it)
                        .then(hasIt => dyids_map.set(it, hasIt))
                    )
            )
            log.info('筛选动态', `并发查询本地dyid完毕`);
        }

        if (lottery_param[0] !== "APIs" && set_lottery_info_url && protoLotteryInfo.length) {
            log.info("上传抽奖信息", "开始")
            await new Promise((resolve) => {
                send({
                    url: set_lottery_info_url,
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    contents: protoLotteryInfo,
                    success: ({ body }) => {
                        log.info("发送获取到的动态数据", body)
                        resolve()
                    },
                    failure: err => {
                        log.error("发送获取到的动态数据", err)
                        resolve()
                    }
                })
            })
        }

        /* 检查动态是否满足要求 */
        await try_for_each(protoLotteryInfo, async function (lottery_info) {
            const {
                lottery_info_type, is_liked,
                uids, uname, dyid, reserve_id, reserve_lottery_text, create_time,
                ctrl, rid, des, type,
                hasOfficialLottery
            } = lottery_info;

            log.debug('正在筛选的动态信息', lottery_info);

            if (lottery_info_type.startsWith('sneak') && sneaktower) {
                log.info("筛选动态", `偷塔模式不检查是否已转发(https://t.bilibili.com/${dyid})`)
            } else {
                /* 遇到转发过就退出 */
                if (
                    ((!check_if_duplicated || check_if_duplicated >= 2) && is_liked)
                    || ((check_if_duplicated >= 1) && dyids_map.get(dyid))
                ) {
                    log.info("筛选动态", `已转发(https://t.bilibili.com/${dyid})`)
                    return false
                }
            }

            /* 超过指定时间退出 */
            if (now_ts - create_time > max_create_time * 86400) {
                log.info("筛选动态", `过时动态(https://t.bilibili.com/${dyid})`)
                return false
            }

            const
                [m_uid, ori_uid] = uids,
                mIsFollowed = !m_uid || (new RegExp(m_uid)).test(attentionList),
                oriIsFollowed = !ori_uid || (new RegExp(ori_uid)).test(attentionList),
                /**判断是转发源动态还是现动态 实际发奖人*/
                [real_uid, realIsFollowed] = lottery_info_type === 'uid'
                    ? [ori_uid, oriIsFollowed]
                    : [m_uid, mIsFollowed],
                description = des.split(/\/\/@.*?:/)[0],
                needAt = /(?:@|艾特)[^@|(艾特)]*?好友/.test(description),
                needTopic = [...new Set(description.match(/(?<=[带加上](?:话题|tag).*)#.+?#|(?<=[带加上])#.+?#(?=话题|tag)/ig) || [])].join(' '),
                isRelayDynamic = type === 1,
                has_key_words = key_words.every(it => new RegExp(it).test(description)),
                isBlock = new RegExp(blockword.join('|')).test(description + reserve_lottery_text),
                isLottery =
                    (is_imitator && lottery_info_type === 'uid' && model !== '00')
                    || (hasOfficialLottery && model[0] === '1')
                    || (!hasOfficialLottery && model[1] === '1' && has_key_words),
                isSendChat =
                    (is_imitator && lottery_info_type === 'uid' && chatmodel !== '00')
                    || (hasOfficialLottery && chatmodel[0] === '1')
                    || (!hasOfficialLottery && chatmodel[1] === '1'),
                { blacklist: remote_blacklist } = use_public_blacklist === false
                    ? { blacklist: "" }
                    : global_var.get("remoteconfig"),
                /**
                 * 获取黑名单并去重合并
                 * @type {string[]}
                 */
                new_blacklist = remote_blacklist
                    ? [
                        ...new Set([...blacklist.split(','),
                        ...remote_blacklist.split(',')])
                    ]
                    : blacklist.split(','),
                keys = [dyid, m_uid, ori_uid];

            log.debug("筛选动态", { real_uid, mIsFollowed, oriIsFollowed, realIsFollowed, needAt, needTopic, type, isRelayDynamic, key_words, has_key_words, blockword, isBlock, isLottery, isSendChat })

            if (
                new_blacklist.some(id => keys.some(key => {
                    if (key + '' === id) {
                        log.info("筛选动态", `黑名单匹配(${id})(https://t.bilibili.com/${dyid})`)
                        return true
                    } else {
                        return false
                    }
                }))
            ) {
                return false
            }

            if (block_dynamic_type.includes(type)) {
                log.warn("筛选动态", `屏蔽动态类型 ${type}`)
                return false
            }

            /**屏蔽词 */
            if (isBlock) {
                log.info("筛选动态", `包含屏蔽词(https://t.bilibili.com/${dyid})`)
                return false
            }

            if (reserve_id) {
                if (disable_reserve_lottery) {
                    log.info("已关闭预约抽奖功能")
                } else {
                    log.info("预约抽奖", "开始");
                    log.info("预约抽奖", `奖品: ${reserve_lottery_text}`);
                    if (hasEnv('NOT_GO_LOTTERY')) {
                        log.info('NOT_GO_LOTTERY', 'ON');
                    } else {
                        await bili.reserve_lottery(reserve_id)
                    }
                }
            }

            if (!has_key_words && description) {
                log.warn("筛选动态", `无关键词动态的描述: ${description}\n\n考虑是否修改设置key_words:\n${key_words.join('\n且满足: ')}`)
                return false
            }

            /**若勾选只转已关注 */
            if (only_followed
                && (!mIsFollowed || !oriIsFollowed)
            ) {
                log.info("筛选动态", `只转已关注(https://t.bilibili.com/${dyid})`)
                return false
            }

            if (isLottery) {
                const { uname_map = {} } = global_var.get("remoteconfig")
                let onelotteryinfo = {};

                onelotteryinfo.isOfficialLottery = hasOfficialLottery;

                /**初始化待关注列表 */
                onelotteryinfo.uid = []

                if (!realIsFollowed) {
                    onelotteryinfo.uid.push(real_uid);
                }

                onelotteryinfo.dyid = dyid;

                let
                    /**转发评语 */
                    RandomStr = getRandomOne(relays)
                        .replace(/\$\{uname\}/g, uname_map[real_uid] || uname),
                    /**控制字段 */
                    new_ctrl = [];

                /* 是否需要带话题 */
                if (needTopic) {
                    RandomStr += needTopic
                }

                /* 是否需要@ */
                if (needAt) {
                    at_users.forEach(it => {
                        new_ctrl.push({
                            data: String(it[1]),
                            location: RandomStr.length,
                            length: it[0].length + 1,
                            type: 1
                        })
                        RandomStr += '@' + it[0]
                    })
                }

                /* 是否是转发的动态 */
                if (isRelayDynamic) {
                    /* 转发内容长度+'//'+'@'+用户名+':'+源内容 */
                    const addlength = RandomStr.length + 2 + uname.length + 1 + 1;
                    onelotteryinfo.relay_chat = RandomStr + `//@${uname}:` + des;
                    new_ctrl.push({
                        data: String(real_uid),
                        location: RandomStr.length + 2,
                        length: uname.length + 1,
                        type: 1
                    })
                    ctrl.map(item => {
                        item.location += addlength;
                        return item;
                    }).forEach(it => new_ctrl.push(it))
                    if (!oriIsFollowed) {
                        onelotteryinfo.uid.push(ori_uid);
                    }
                } else {
                    onelotteryinfo.relay_chat = RandomStr;
                }

                onelotteryinfo.ctrl = JSON.stringify(new_ctrl);

                /* 根据动态的类型决定评论的类型 */
                onelotteryinfo.chat_type =
                    type === 2
                        ? 11
                        : type === 4 || type === 1
                            ? 17
                            : type === 8
                                ? 1
                                : 0;

                /* 是否评论 */
                if (isSendChat) {
                    onelotteryinfo.rid = rid
                    onelotteryinfo.chat = getRandomOne(chats)
                        .replace(/\$\{uname\}/g, uname_map[real_uid] || uname)
                }

                alllotteryinfo.push(onelotteryinfo);
            } else {
                log.info("筛选动态", `非抽奖动态(https://t.bilibili.com/${dyid})`)
            }
        })

        return alllotteryinfo;
    }
    /**
     * 关注转发评论
     * @param {LotteryOptions} option
     * @returns {Promise<number>}
     * - 成功 0
     * - 评论 未知错误 1001
     * - 评论 原动态已删除 1002
     * - 评论 评论区已关闭 1003
     * - 评论 需要输入验证码 1004
     * - 评论 已被对方拉入黑名单 1005
     * - 评论 黑名单用户无法互动 1006
     * - 评论 UP主已关闭评论区 1007
     * - 关注 未知错误 2001
     * - 关注 您已被对方拉入黑名单 2002
     * - 关注 黑名单用户无法关注 2003
     * - 关注 账号异常 2004
     * - 关注 关注已达上限 2005
     * - 分区 移动失败 3001
     * - 点赞 未知错误 4001
     * - 点赞 点赞异常 4002
     * - 点赞 点赞频繁 4003
     * - 转发 未知错误 5001
     * - 转发 该动态不能转发分享 5002
     * - 转发 请求数据发生错误，请刷新或稍后重试 5003
     * - 转发 操作太频繁了，请稍后重试 5004
     */
    async go(option) {
        log.debug('正在转发的动态信息', option);
        if (hasEnv('NOT_GO_LOTTERY')) {
            log.info('NOT_GO_LOTTERY', 'ON');
            return 0
        }

        let status = 0
        const
            { uid, dyid, chat_type, rid, relay_chat, ctrl, chat } = option,
            { check_if_duplicated, is_repost_then_chat } = config;

        /* 评论 */
        if (rid && chat_type) {

            status = await retryfn(
                5,
                [1, 4],
                () => bili.sendChat(
                    rid,
                    is_repost_then_chat ? relay_chat.split('//')[0] : chat,
                    chat_type
                )
            )

            if (status === 8) {
                status = await bili.sendChat(
                    rid,
                    "[doge]",
                    chat_type
                )
            }

            if (status) {
                log.warn("抽奖信息", `dyid: ${dyid}, rid: ${rid}, chat_type: ${chat_type}`)
                return 1000 + status
            }
        }

        /* 关注 */
        if (uid.length) {
            await try_for_each(uid, async (u) => {
                status = await bili.autoAttention(u)
                if (status) {
                    log.warn("抽奖信息", `dyid: ${dyid}, uid: ${u}`)
                    return true
                } else if (await bili.movePartition(u, this.tagid)) {
                    log.warn("抽奖信息", `dyid: ${dyid}, uid: ${u} tagid: ${this.tagid}`)
                    /* 3000系错误 */
                    status = 1001
                    return true
                } else {
                    return false
                }
            })
            if (status) return 2000 + status
        }

        /* 点赞 */
        if (!check_if_duplicated || check_if_duplicated === 3) {
            status = await retryfn(
                5,
                [1, 2, 3],
                () => bili.autolike(dyid)
            )

            if (status) {
                log.warn("抽奖信息", `dyid: ${dyid}`)
                return 4000 + status
            }
        }

        /* 转发 */
        status = await retryfn(
            5,
            [1, 3, 4],
            () => bili.autoRelay(global_var.get("myUID"), dyid, relay_chat, ctrl)
        )

        if (status) {
            log.warn("抽奖信息", `dyid: ${dyid}`)
            return 5000 + status
        }

        return status
    }
}


module.exports = { Monitor };