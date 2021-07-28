const Util = require('./Util');
const BiliAPI = require('./BiliAPI');
const { sendNotify } = require('./sendNotify');
const eventBus = require('./eventBus');
const Public = require('./Public');
const GlobalVar = require("./GlobalVar");
const config = require("./config");
const MyStorage = require('./MyStorage');
const { log, hasEnv } = Util;

/**
 * 监视器
 */
class Monitor extends Public {
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
        ]);
    }
    /**
     * 初始化
     */
    async init() {
        if (config.model === '00') {
            eventBus.emit('Turn_off_the_Monitor', '已关闭所有转发行为')
            return
        }
        if (!this.tagid) {
            this.tagid = await BiliAPI.checkMyPartition() /* 检查关注分区 */
            if (!this.tagid) {
                eventBus.emit('Turn_off_the_Monitor', '分区获取失败')
                return
            }
        }
        /** 关注列表初始化 */
        this.attentionList = await BiliAPI.getAttentionList(GlobalVar.get("myUID"));
        switch (await this.startLottery()) {
            case 0:
                eventBus.emit('Turn_on_the_Monitor')
                break;
            case 11:
                eventBus.emit('Turn_off_the_Monitor', '评论失败')
                break
            case 21:
                eventBus.emit('Turn_on_the_Monitor')
                break
            case 22:
                if (!config.is_exception) {
                    config.is_exception = true;
                    await sendNotify('[动态抽奖]账号异常通知', `UID: ${GlobalVar.get('myUID')}\n\n已自动跳过异常关注(异常号只会对部分UP出现关注异常)\n\n可在设置中令is_exception为true关闭此推送`)
                }
                eventBus.emit('Turn_on_the_Monitor')
                break
            case 31:
                eventBus.emit('Turn_on_the_Monitor')
                break
            case 41:
                eventBus.emit('Turn_off_the_Monitor', '转发失败')
                break
            case 51:
                eventBus.emit('Turn_off_the_Monitor', '获取开奖时间失败')
                break
            case 61:
                eventBus.emit('Turn_off_the_Monitor', '获取关注数失败')
                break
            default:
                eventBus.emit('Turn_off_the_Monitor', '未知错误')
                break;
        }
    }
    /**
     * 启动
     * @returns {Promise<number>}
     */
    async startLottery() {
        const allLottery = await this.filterLotteryInfo()
            , len = allLottery.length;

        log.info('筛选动态', `筛选完毕(${len})`);

        if (len) {
            for (const Lottery of allLottery) {
                let status = 0;
                if (Lottery.isOfficialLottery) {
                    let { ts } = await BiliAPI.getLotteryNotice(Lottery.dyid);
                    const ts_10 = Date.now() / 1000;
                    if (ts < 0) {
                        return 51
                    }
                    if (ts < ts_10) {
                        log.info('过滤', '已过开奖时间')
                        MyStorage.updateDyid(Lottery.dyid)
                        continue
                    }
                    if (ts > ts_10 + config.maxday * 86400) {
                        log.info('过滤', '超过指定开奖时间')
                        MyStorage.updateDyid(Lottery.dyid)
                        continue
                    }
                } else if (Lottery.uid[0]) {
                    const followerNum = await BiliAPI.getUserInfo(Lottery.uid[0]);
                    if (followerNum < 0) {
                        return 61
                    }
                    if (followerNum < config.minfollower) {
                        log.info('过滤', `粉丝数(${followerNum})小于指定数量`)
                        MyStorage.updateDyid(Lottery.dyid)
                        continue
                    }
                }
                status = await this.go(Lottery)
                if (status % 2 !== 0) {
                    return status
                }
                MyStorage.updateDyid(Lottery.dyid);
                await Util.delay(config.wait * (Math.random() + 0.5));
            }
            log.info('抽奖', '开始转发下一组动态');
            return 0
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
        let protoLotteryInfo = await LotteryInfoMap.get(lottery_param[0])(lottery_param[1]);

        if (protoLotteryInfo === null)
            return [];

        log.info('筛选动态', `开始筛选(${protoLotteryInfo.length})`);

        log.debug('未进行筛选的动态信息', protoLotteryInfo);

        /** 所有抽奖信息 */
        let alllotteryinfo = [];
        const { key_words, model, chatmodel, is_imitator, only_followed, at_users, blockword, blacklist } = config;
        /**Map<String, Boolean> */
        let dyids_map = new Map();

        /**去重 */
        protoLotteryInfo = protoLotteryInfo.filter(({ dyid }) => {
            if (dyids_map.has(dyid)) {
                return false
            }
            dyids_map.set(dyid, false);
            return true
        });

        /**并发查询dyid */
        await Promise.all(
            [...dyids_map.keys()]
                .map(it => MyStorage
                    .searchDyid(it)
                    .then(hasIt => dyids_map.set(it, hasIt))
                )
        )

        /* 检查动态是否满足要求 */
        await Util.try_for_each(protoLotteryInfo, async function ({
            lottery_info_type, uids,
            uname, dyid,
            ctrl, rid, des, type,
            hasOfficialLottery
        }) {
            /* 遇到转发过就退出 */
            if (dyids_map.get(dyid)) return false;

            const
                /**判断是转发源动态还是现动态 */
                uid = lottery_info_type === 'uid' ? uids[1] : uids[0]
                , isFollowed = (new RegExp(uid)).test(attentionList)
                , description = typeof des === 'string' ? des : ''
                , needAt = /(?:@|艾特)[^@|(艾特)]*?好友/.test(description)
                , needTopic = (/(?<=[带加上](?:话题|tag))#.*#/i.exec(description) || [])[0]
                , isRelayDynamic = type === 1
                , isTwoLevelDynamic = /\/\/@/.test(description)
                , has_key_words = key_words.every(it => new RegExp(it).test(description))
                , isBlock = new RegExp(blockword.join('|')).test(description)
                , isLottery =
                    (is_imitator && lottery_info_type === 'uid' && model !== '00')
                    || (hasOfficialLottery && model[0] === '1')
                    || (!hasOfficialLottery && model[1] === '1' && !isTwoLevelDynamic && has_key_words)
                , isSendChat =
                    (is_imitator && lottery_info_type === 'uid' && chatmodel !== '00')
                    || (hasOfficialLottery && chatmodel[0] === '1')
                    || (!hasOfficialLottery && chatmodel[1] === '1');

            /**屏蔽词 */
            if (isBlock) return false;

            /**若勾选只转已关注 */
            if (only_followed && !isFollowed) return false;

            /* 获取黑名单并去重合并 */
            const { blacklist: remote_blacklist } = GlobalVar.get("remoteconfig")
                , new_blacklist = remote_blacklist
                    ? [...new Set([...blacklist.split(','), ...remote_blacklist.split(',')])].join()
                    : blacklist;
            if ((new RegExp(dyid + '|' + uid)).test(new_blacklist)) return false;


            if (isLottery) {
                let onelotteryinfo = {};

                onelotteryinfo.isOfficialLottery = hasOfficialLottery;

                /**初始化待关注列表 */
                onelotteryinfo.uid = []

                if (!isFollowed) {
                    onelotteryinfo.uid.push(uid);
                }

                onelotteryinfo.dyid = dyid;

                let
                    /**转发评语 */
                    RandomStr = Util.getRandomOne(config.relay),
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
                        data: String(uid),
                        location: RandomStr.length + 2,
                        length: uname.length + 1,
                        type: 1
                    })
                    ctrl.map(item => {
                        item.location += addlength;
                        return item;
                    }).forEach(it => new_ctrl.push(it))
                    if (!(new RegExp(uids[1])).test(attentionList))
                        onelotteryinfo.uid.push(uids[1]);
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
            }
        })

        return alllotteryinfo;
    }
    /**
     * 关注转发评论
     * @param {LotteryOptions} option
     * @returns {Promise<number>}
     * 0 - 成功  
     * 11 - 评论错误  
     * 21 - 关注错误  
     * 22 - 关注异常  
     * 31 - 点赞失败  
     * 41 - 转发失败  
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
            let status = 0;
            const max_retry_times = 5;
            for (let times = 0; times < max_retry_times; times++) {
                status = await BiliAPI.sendChat(rid, Util.getRandomOne(config.chat), chat_type)
                if (!status) {
                    break
                }
                log.info('自动评论', `将在 ${times + 1} 分钟后再次发送评论(${times + 1}/${max_retry_times})`)
                await Util.delay(60 * 1000 * (times + 1))
            }
            if (status) return 11;
        }

        /* 关注 */
        const [u1, u2] = uid
        if (u1) {
            let status = await BiliAPI.autoAttention(u1)
            if (status) return 20 + status;
            status = await BiliAPI.movePartition(u1, this.tagid)
            if (status) return 20 + status;
            if (u2) {
                Util.delay(5000)
                status = await BiliAPI.autoAttention(u2)
                if (status) return 20 + status;
                status = await BiliAPI.movePartition(u2, this.tagid)
                if (status) return 20 + status;
            }
        }

        /* 点赞 */
        if (await BiliAPI.autolike(dyid)) return 31;

        /* 转发 */
        if (await BiliAPI.autoRelay(GlobalVar.get("myUID"), dyid, relay_chat, ctrl)) return 41;

        return 0
    }
}


module.exports = Monitor;