const Base = require('./Base');
const BiliAPI = require('./BiliAPI');
const eventBus = require('./eventBus');
const Public = require('./Public');
const GlobalVar = require("./GlobalVar.json");
const config = require("./config");

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
        this.tagid = 0; /* tagid初始化为默认分组 */
        this.attentionList = ''; /* 转为字符串的所有关注的up主uid */
        this.AllMyLotteryInfo = ''; /* 转发过的动态信息 */
    }
    /**
     * 初始化
     */
    async init() {
        if (config.model === '00') { console.log('已关闭所有转发行为'); return; }
        if (GlobalVar.Lottery.length === 0) { console.log('抽奖信息为空'); return; }
        this.tagid = await BiliAPI.checkMyPartition(); /* 检查关注分区 */
        this.attentionList = await BiliAPI.getAttentionList(GlobalVar.myUID);
        const AllDynamic = await this.checkAllDynamic(GlobalVar.myUID, 10);
        let string = '';
        for (let index = 0; index < AllDynamic.length; index++) {
            const oneDynamicObj = AllDynamic[index];
            if (typeof oneDynamicObj.origin_dynamic_id === 'string') {
                string += oneDynamicObj.origin_dynamic_id;
            }
        }
        this.AllMyLotteryInfo = string;
        this.startLottery();
    }
    /**
     * 启动
     * @returns {Promise<boolean>}
     */
    async startLottery() {
        const allLottery = await this.filterLotteryInfo();
        const len = allLottery.length;
        let index = 0;
        if (len === 0) {
            eventBus.emit('Turn_on_the_Monitor');
            return false;
        } else {
            for (const Lottery of allLottery) {
                const a = await this.go(Lottery);
                if (a === 0) return;
                if (index++ === len - 1) {
                    console.log('开始转发下一组动态');
                    eventBus.emit('Turn_on_the_Monitor');
                    return;
                }
            }
        }
    }
    /**
     * 抽奖配置
     * @typedef {object} LotteryOptions
     * @property {number} uid 用户标识
     * @property {string} dyid 动态标识
     * @property {number} type 动态类型
     * @property {string} rid 评论类型
     */
    /**
     * @returns {Promise<LotteryOptions[] | []>
    }
     */
    async filterLotteryInfo() {
        const self = this,
            protoLotteryInfo = typeof self.UID === 'number' ? await self.getLotteryInfoByUID(self.UID) : await self.getLotteryInfoByTag(self.tag_name);
        if (protoLotteryInfo === null) return [];
        let alllotteryinfo = [];
        const { model, chatmodel, maxday: _maxday, minfollower, blockword, blacklist } = config;
        const maxday = _maxday === '-1' || _maxday === '' ? Infinity : (Number(_maxday) * 86400);
        for (const info of protoLotteryInfo) {
            const { uid, dyid, official_verify, befilter, rid, des, type, hasOfficialLottery } = info;
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
            if (hasOfficialLottery && model[0] === '1') {
                const oneLNotice = await BiliAPI.getLotteryNotice(dyid);
                ts = oneLNotice.ts;
                isLottery = ts > now_ts_10 && ts < now_ts_10 + maxday;
                isSendChat = chatmodel[0] === '1';
            } else if (!hasOfficialLottery && model[1] === '1') {
                if (!/奖/.test(description)) continue;
                ts = Base.getLotteryNotice(description).ts;
                if (!official_verify) {
                    const followerNum = await BiliAPI.getUserInfo(uid);
                    if (followerNum < Number(minfollower)) continue;
                    isLottery = /[转关].*[转关]/.test(description) && !befilter && (ts === 0 || (ts > now_ts_10 && ts < now_ts_10 + maxday));
                } else {
                    isLottery = ts === 0 || (ts > now_ts_10 && ts < now_ts_10 + maxday);
                }
                isSendChat = chatmodel[1] === '1';
            }
            if (isLottery) {
                const reg1 = new RegExp(uid);
                const reg2 = new RegExp(dyid);
                if (reg1.test(blacklist) || reg2.test(blacklist)) continue;
                /* 判断是否关注过 */
                reg1.test(self.attentionList) ? void 0 : onelotteryinfo.uid = uid;
                /* 判断是否转发过 */
                reg2.test(self.AllMyLotteryInfo) ? void 0 : onelotteryinfo.dyid = dyid;
                /* 根据动态的类型决定评论的类型 */
                onelotteryinfo.type = (type === 2) ? 11 : (type === 4) ? 17 : 0;
                /* 是否评论 */
                isSendChat ? onelotteryinfo.rid = rid : void 0;
                if (typeof onelotteryinfo.uid === 'undefined' && typeof onelotteryinfo.dyid === 'undefined') continue;
                alllotteryinfo.push(onelotteryinfo);
            }
        }
        return alllotteryinfo;
    }
    /**
     * 关注转发评论
     * @param {LotteryOptions} option
     */
    async go(option) {
        const { uid, dyid, type, rid } = option;
        let ret = '';
        if (typeof dyid === 'string') {
            ret += await BiliAPI.autoRelay(GlobalVar.myUID, dyid);
            ret += await BiliAPI.autolike(dyid);
            if (typeof uid === 'number') {
                ret += await BiliAPI.autoAttention(uid);
                ret += await BiliAPI.movePartition(uid, this.tagid);
            }
            if (typeof rid === 'string' && type !== 0) {
                ret += await BiliAPI.sendChat(rid, Base.getRandomStr(config.chat), type);
            }
            await Base.delay(Number(config.wait));
        }
        return (ret === '' || ret.indexOf('0') === -1) ? 1 : 0;
    }
}

module.exports = Monitor;