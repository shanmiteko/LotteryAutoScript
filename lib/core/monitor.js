const { log, hasEnv, shuffle, getRandomOne, delay, try_for_each } = require('../utils');
const { send } = require('../net/http');
const bili = require('../net/bili');
const { sendNotify } = require('../helper/notify');
const event_bus = require('../helper/event_bus');
const { randomDynamic } = require('../helper/randomDynamic')
const { Searcher } = require('./searcher');
const global_var = require("../data/global_var");
const config = require("../data/config");

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
            case 11:
                event_bus.emit('Turn_off_the_Monitor', '评论失败')
                break
            case 21:
                event_bus.emit('Turn_off_the_Monitor', '关注出错')
                break
            case 22:
                log.warn('账号异常', `UID(${global_var.get('myUID')})异常号只会对部分UP出现关注异常`)
                if (!config.is_exception) {
                    await sendNotify('[动态抽奖]账号异常通知', `UID: ${global_var.get('myUID')}\n\n异常号只会对部分UP出现关注异常\n\n可在设置中令is_exception为true关闭此推送`)
                }
                config.is_exception = true;
                event_bus.emit('Turn_on_the_Monitor')
                break
            case 31:
                event_bus.emit('Turn_off_the_Monitor', '转发失败')
                break
            case 41:
                event_bus.emit('Turn_off_the_Monitor', '获取开奖时间失败')
                break
            case 51:
                event_bus.emit('Turn_off_the_Monitor', '获取关注数失败')
                break
            default:
                event_bus.emit('Turn_off_the_Monitor', '未知错误')
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
            let is_exception = false;
            for (const [index, Lottery] of shuffle(allLottery).entries()) {
                let status = 0;

                if (Lottery.isOfficialLottery) {
                    let { ts } = await bili.getLotteryNotice(Lottery.dyid);
                    const ts_10 = Date.now() / 1000;
                    if (ts < 0) {
                        return 41
                    }
                    if (ts < ts_10) {
                        log.info('过滤', '已过开奖时间')
                        await delay(filter_wait)
                        continue
                    }
                    if (ts > ts_10 + config.maxday * 86400) {
                        log.info('过滤', '超过指定开奖时间')
                        await delay(filter_wait)
                        continue
                    }
                } else if (Lottery.uid[0]) {
                    const { minfollower } = config
                    if (minfollower > 0) {
                        const followerNum = await bili.getUserInfo(Lottery.uid[0]);
                        if (followerNum < 0) {
                            return 51
                        }
                        if (followerNum < minfollower) {
                            log.info('过滤', `粉丝数(${followerNum})小于指定数量`)
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

                status = await this.go(Lottery)
                switch (status) {
                    case 0:
                    case 9:
                    case 19:
                        break;
                    case 22:
                        is_exception = true
                        break;
                    default:
                        return status
                }

                await delay(wait * (Math.random() + 0.5));
            }
            log.info('抽奖', '开始转发下一组动态');
            if (is_exception) {
                return 22
            } else {
                return 0
            }
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
     * @property {string} rid 评论标识
     * @property {number} chat_type 评论类型
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
            { set_lottery_info_url, key_words, model, chatmodel, max_create_time, is_imitator, only_followed, at_users, blockword, blacklist } = config,
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
                uids, uname, dyid, create_time,
                ctrl, rid, des, type,
                hasOfficialLottery
            } = lottery_info;

            log.debug('正在筛选的动态信息', lottery_info);

            /* 遇到转发过就退出 */
            if (is_liked) {
                log.info("筛选动态", `已转发(https://t.bilibili.com/${dyid})`)
                return false
            }

            /* 超过指定时间退出 */
            if (now_ts - create_time > max_create_time * 86400) {
                log.info("筛选动态", `过时动态(https://t.bilibili.com/${dyid})`)
                return false
            }

            const
                [m_uid, ori_uid] = uids,
                mIsFollowed = m_uid && (new RegExp(m_uid)).test(attentionList),
                oriIsFollowed = ori_uid && (new RegExp(ori_uid)).test(attentionList),
                /**判断是转发源动态还是现动态 实际发奖人*/
                [real_uid, realIsFollowed] = lottery_info_type === 'uid'
                    ? [ori_uid, oriIsFollowed]
                    : [m_uid, mIsFollowed],
                description = typeof des === 'string' ? des : '',
                needAt = /(?:@|艾特)[^@|(艾特)]*?好友/.test(description),
                needTopic = [...new Set(description.match(/(?<=[带加上](?:话题|tag).*)#.+?#|(?<=[带加上])#.+?#(?=话题|tag)/ig) || [])].join(' '),
                isRelayDynamic = type === 1,
                isTwoLevelDynamic = /\/\/@/.test(description),
                has_key_words = key_words.every(it => new RegExp(it).test(description)),
                isBlock = new RegExp(blockword.join('|')).test(description),
                isLottery =
                    (is_imitator && lottery_info_type === 'uid' && model !== '00')
                    || (hasOfficialLottery && model[0] === '1')
                    || (!hasOfficialLottery && model[1] === '1' && !isTwoLevelDynamic && has_key_words),
                isSendChat =
                    (is_imitator && lottery_info_type === 'uid' && chatmodel !== '00')
                    || (hasOfficialLottery && chatmodel[0] === '1')
                    || (!hasOfficialLottery && chatmodel[1] === '1');

            log.debug("筛选动态", { real_uid, mIsFollowed, oriIsFollowed, realIsFollowed, needAt, needTopic, isRelayDynamic, isTwoLevelDynamic, key_words, has_key_words, isBlock, isLottery, isSendChat })

            /**屏蔽词 */
            if (isBlock) {
                log.info("筛选动态", `包含屏蔽词(https://t.bilibili.com/${dyid})`)
                return false
            }

            /**若勾选只转已关注 */
            if (only_followed && !mIsFollowed && !oriIsFollowed) {
                log.info("筛选动态", `只转已关注(https://t.bilibili.com/${dyid})`)
                return false
            }

            /* 获取黑名单并去重合并 */
            const
                { blacklist: remote_blacklist } = global_var.get("remoteconfig"),
                new_blacklist = remote_blacklist
                    ? [
                        ...new Set([...blacklist.split(','),
                        ...remote_blacklist.split(',')])
                    ].join()
                    : blacklist;

            if ((new RegExp(dyid + '|' + m_uid + '|' + ori_uid)).test(new_blacklist)) {
                log.info("筛选动态", `黑名单用户(https://t.bilibili.com/${dyid})`)
                return false
            }


            if (isLottery) {
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
                    RandomStr = getRandomOne(config.relay),
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
                if (isRelayDynamic && real_uid) {
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
                if (isSendChat) onelotteryinfo.rid = rid;

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
     * 0 - 成功  
     * 9 - 评论黑名单/评论区关闭/动态删除  
     * 11 - 评论错误  
     * 19 - 关注黑名单  
     * 21 - 关注错误  
     * 22 - 关注异常  
     * 31 - 转发失败  
     */
    async go(option) {
        log.debug('正在转发的动态信息', option);
        if (hasEnv('NOT_GO_LOTTERY')) {
            log.info('NOT_GO_LOTTERY', 'ON');
            return 0
        }

        const { uid, dyid, chat_type, rid, relay_chat, ctrl } = option;

        /* 评论 */
        if (rid && chat_type) {
            let status = 0
            const
                { chat } = config,
                retry = [...new Array(5).keys()],
                max_retry_times = retry.length;
            await try_for_each(retry, async (times) => {
                status = await bili.sendChat(rid, getRandomOne(chat), chat_type)
                switch (status) {
                    case 0:
                        return true
                    case -1:
                        log.warn('抽奖信息', `uid: ${uid},dyid: ${dyid}`)
                        return true
                    default:
                        log.error('抽奖信息', `uid: ${uid},dyid: ${dyid}`)
                        log.info('自动评论', `将在 ${times + 1} 分钟后再次发送评论(${times + 1}/${max_retry_times})`)
                        await delay(60 * 1000 * (times + 1))
                        return false
                }
            })
            if (status) return 10 + status;
        }

        /* 关注 */
        if (uid.length) {
            let status = 0
            await try_for_each(uid, async (u) => {
                status = await bili.autoAttention(u)
                switch (status) {
                    case 0:
                        if (await bili.movePartition(u, this.tagid)) {
                            log.error('抽奖信息', `uid: ${u},dyid: ${dyid}`)
                        }
                        return false
                    case -1:
                    case 2:
                        log.warn('抽奖信息', `uid: ${u},dyid: ${dyid}`)
                        return true
                    default:
                        log.error('抽奖信息', `uid: ${u},dyid: ${dyid}`)
                        return true
                }
            })
            if (status) return 20 + status
        }

        /* 点赞 */
        await bili.autolike(dyid)

        /* 转发 */
        if (await bili.autoRelay(global_var.get("myUID"), dyid, relay_chat, ctrl)) return 31;

        return 0
    }
}


module.exports = { Monitor };