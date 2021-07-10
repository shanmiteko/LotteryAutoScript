const Base = require('./Base');
const BiliAPI = require('./BiliAPI');
const { sendNotify } = require('./sendNotify');
const eventBus = require('./eventBus');
const Public = require('./Public');
const GlobalVar = require("./GlobalVar");
const config = require("./config");
const MyStorage = require('./MyStorage');

/**
 * 监视器
 */
class Monitor extends Public {
    /**
     * @constructor
     * @param {number | string} param
     */
    constructor(param) {
        super();
        typeof param === 'number' ? this.UID = param : this.tag_name = param;
        this.tagid = config.partition_id; /* tagid初始化 */
        this.attentionList = ''; /* 转为字符串的所有关注的up主uid */
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
        this.attentionList = await BiliAPI.getAttentionList(GlobalVar.get("myUID")); /* 获取关注列表 */
        await this.startLottery();
    }
    /**
     * 启动
     * @returns {Promise<boolean>}
     */
    async startLottery() {
        const allLottery = await this.filterLotteryInfo();
        let status = 1;
        if (allLottery instanceof Array) {
            if (allLottery.length) {
                let dyids = [];
                for (const Lottery of allLottery) {
                    status = await this.go(Lottery);
                    if (status % 2) break
                    dyids.push(Lottery.dyid);
                }
                if (dyids.length) MyStorage.updateDyid(dyids.toString())
                Base.tooltip.log('开始转发下一组动态');
            } else {
                status = 0;
                Base.tooltip.log('无未转发抽奖');
            }
        }
        switch (status) {
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
            default:
                eventBus.emit('Turn_off_the_Monitor', '出错 status:' + status)
                break;
        }
    }
    /**
     * 抽奖配置
     * @typedef {object} LotteryOptions
     * @property {number[]} uid 用户标识
     * @property {string} dyid 动态标识
     * @property {number} type 动态类型
     * @property {string} relay_chat 动态类型
     * @property {string} ctrl 定位@
     * @property {string} rid 评论类型
     */
    /**
     * @returns {Promise<LotteryOptions[] | null>}
     */
    async filterLotteryInfo() {
        const self = this,
            protoLotteryInfo = typeof self.UID === 'number'
                ? await self.getLotteryInfoByUID(self.UID)
                : await self.getLotteryInfoByTag(self.tag_name);

        if (protoLotteryInfo === null)
            return [];

        /** 所有抽奖信息 */
        let alllotteryinfo = [];
        const { model, chatmodel, is_imitator, maxday: _maxday, minfollower, skip_official_verify, only_followed, at_users, blockword, blacklist } = config;
        const maxday = _maxday * 86400
        let dyids_set = new Set();
        for (const info of protoLotteryInfo) {
            const { lottery_info_type, uids, uname, dyid, official_verify, ctrl, befilter, rid, des, type, hasOfficialLottery } = info;

            /**dyid去重 */
            if (dyids_set.has(dyid)) continue;
            dyids_set.add(dyid);

            /**判断是转发源动态还是现动态 */
            const uid = lottery_info_type === 'tag' ? uids[0] : uids[1];

            const now_ts_10 = Date.now() / 1000;
            let onelotteryinfo = {};
            let isLottery = false;
            let isSendChat = false;
            let isBlock = false;
            let ts = 0;
            const description = typeof des === 'string' ? des : '';
            for (let index = 0; index < blockword.length; index++) {
                const word = blockword[index];
                const reg = new RegExp(word);
                isBlock = reg.test(description) ? true : false;
                if (isBlock) break;
            }
            if (isBlock) continue;
            const needAt = /(?:@|艾特)[^@|(艾特)]*?好友/.test(description);
            const needTopic = (/(?<=[带加上](?:话题|tag))#.*#/i.exec(description) || [])[0];
            const isTwoLevelRelay = /\/\/@/.test(description);
            const haslottery = /[抽奖]/.test(description);
            const hasGuanZhuan = /[转关].*[转关]/.test(description);
            if (lottery_info_type === 'uid' && is_imitator) {
                isLottery = true;
            } else if (hasOfficialLottery && model[0] === '1') {
                ({ ts } = await BiliAPI.getLotteryNotice(dyid));
                if (ts < 0) { alllotteryinfo = null; break }
                isLottery = ts > now_ts_10 && ts < now_ts_10 + maxday;
                isSendChat = chatmodel[0] === '1';
            } else if (!hasOfficialLottery && model[1] === '1' && haslottery && hasGuanZhuan && !isTwoLevelRelay) {
                ({ ts } = Base.getLotteryNotice(description));
                if (official_verify && skip_official_verify) {
                    isLottery = ts === 0 || (ts > now_ts_10 && ts < now_ts_10 + maxday);
                } else {
                    const followerNum = await BiliAPI.getUserInfo(uid);
                    if (followerNum < 0) { alllotteryinfo = null; break }
                    if (followerNum < minfollower) continue;
                    isLottery = !befilter && (ts === 0 || (ts > now_ts_10 && ts < now_ts_10 + maxday));
                }
                isSendChat = chatmodel[1] === '1';
            }
            if (isLottery) {
                /* 判断是否关注过 */
                const isFollowed = (new RegExp(uid)).test(self.attentionList);
                if (only_followed && !isFollowed) continue;
                /* 判断是否转发过 */
                const isRelay = await MyStorage.searchDyid(dyid);
                /* 获取黑名单并去重合并 */
                const { blacklist: remote_blacklist } = GlobalVar.get("remoteconfig");
                const new_blacklist = remote_blacklist ?
                    Array.from(new Set([...blacklist.split(','), ...remote_blacklist.split(',')])).toString() : blacklist;
                /* 进行判断 */
                if ((new RegExp(dyid + '|' + uid)).test(new_blacklist)) continue;
                onelotteryinfo.uid = [] /**初始化待关注列表 */
                if (!isFollowed) onelotteryinfo.uid.push(uid);
                if (!isRelay) {
                    onelotteryinfo.dyid = dyid;
                    let RandomStr = Base.getRandomOne(config.relay);
                    let new_ctrl = [];
                    if (needTopic) {
                        RandomStr += needTopic
                    }
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
                    if (type === 1) {
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
                        if (!(new RegExp(uids[1])).test(self.attentionList))
                            onelotteryinfo.uid.push(uids[1]);
                    } else {
                        onelotteryinfo.relay_chat = RandomStr;
                    }
                    onelotteryinfo.ctrl = JSON.stringify(new_ctrl);
                }
                /* 根据动态的类型决定评论的类型 */
                onelotteryinfo.type = type === 2 ?
                    11 : type === 4 || type === 1 ?
                        17 : type === 8 ?
                            1 : 0;
                /* 是否评论 */
                if (isSendChat) onelotteryinfo.rid = rid;
                if (onelotteryinfo.dyid) alllotteryinfo.push(onelotteryinfo);
            }
        }
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
        let status = 1;
        const { uid, dyid, type, rid, relay_chat, ctrl } = option;
        /* 评论 */
        if (typeof rid === 'string' && type !== 0) {
            const send = () => BiliAPI.sendChat(rid, Base.getRandomOne(config.chat) || relay_chat, type);
            const max_retry_times = 5;
            for (let times = 0; times < max_retry_times && status; times++) {
                status = await send();
                if (status) {
                    Base.tooltip.log(`将在 ${times + 1} 分钟后再次发送评论(${times + 1}/${max_retry_times})`)
                    await Base.delay(60 * 1000 * (times + 1))
                }
            }
            if (status) return 11;
        }

        /* 关注 */
        if (uid.length) {
            status = 0
            for (let index = 0; index < uid.length && !status; index++) {
                const one_uid = uid[index];
                if (typeof one_uid === 'number') {
                    status = await BiliAPI.autoAttention(uid);
                    await Base.delay(5000);
                    if (!status) await BiliAPI.movePartition(uid, this.tagid);
                }
            }
            if (status) return 20 + status;
        }

        /* 点赞 */
        if (await BiliAPI.autolike(dyid)) return 31;

        /* 转发 */
        if (await BiliAPI.autoRelay(GlobalVar.get("myUID"), dyid, relay_chat, ctrl)) return 41;

        /* 延时 */
        await Base.delay(config.wait * (Math.random() + 0.5));

        return 0
    }
}

module.exports = Monitor;