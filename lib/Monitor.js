const Base = require('./Base');
const BiliAPI = require('./BiliAPI');
const eventBus = require('./eventBus');
const Public = require('./Public');
const GlobalVar = require("./GlobalVar.json");
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
        this.tagid = 0; /* tagid初始化为默认分组 */
        this.attentionList = ''; /* 转为字符串的所有关注的up主uid */
        this.AllMyLotteryInfo = ''; /* 转发过的动态信息 */
        this.isAttentionErr = false;
    }
    /**
     * 初始化
     */
    async init() {
        if (config.model === '00') { console.log('已关闭所有转发行为'); return; }
        if (GlobalVar.Lottery.length === 0) { console.log('抽奖信息为空'); return; }
        this.tagid = await BiliAPI.checkMyPartition(); /* 检查关注分区 */
        this.attentionList = await BiliAPI.getAttentionList(GlobalVar.myUID); /* 获取关注列表 */
        const alldyid = await MyStorage.getDyid(); /* 获取储存的之前转过的所有动态 */
        if (alldyid.length < 5) {
            const { allModifyDynamicResArray: AllDynamic } = (await this.checkAllDynamic(GlobalVar.myUID, 5));
            let newdyid = '';
            for (let index = 0; index < AllDynamic.length; index++) {
                const oneDynamicObj = AllDynamic[index];
                if (typeof oneDynamicObj.origin_dynamic_id === 'string')
                    newdyid += oneDynamicObj.origin_dynamic_id + ',';
            }
            this.AllMyLotteryInfo = (Array.from(new Set([...newdyid.split(','), ...alldyid.split(',')]))).toString();
            await MyStorage.updateDyid(this.AllMyLotteryInfo);
        } else {
            this.AllMyLotteryInfo = alldyid;
        }
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
     * @property {number[]} uid 用户标识
     * @property {string} dyid 动态标识
     * @property {number} type 动态类型
     * @property {string} relay_chat 动态类型
     * @property {string} ctrl 定位@
     * @property {string} rid 评论类型
     */
    /**
     * @returns {Promise<LotteryOptions[] | []>}
     */
    async filterLotteryInfo() {
        const self = this,
            protoLotteryInfo = typeof self.UID === 'number' ? await self.getLotteryInfoByUID(self.UID) : await self.getLotteryInfoByTag(self.tag_name);
        if (protoLotteryInfo === null) return [];
        let alllotteryinfo = [];
        const { model, chatmodel, maxday: _maxday, minfollower, blockword, blacklist } = config;
        const maxday = _maxday === '-1' || _maxday === '' ? Infinity : (Number(_maxday) * 86400);
        for (const info of protoLotteryInfo) {
            const { lottery_info_type, uids, uname, dyid, official_verify, ctrl, befilter, rid, des, type, hasOfficialLottery } = info;
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
            if (hasOfficialLottery && model[0] === '1') {
                const oneLNotice = await BiliAPI.getLotteryNotice(dyid);
                ts = oneLNotice.ts;
                isLottery = ts > now_ts_10 && ts < now_ts_10 + maxday;
                isSendChat = chatmodel[0] === '1';
            } else if (!hasOfficialLottery && model[1] === '1') {
                if (!/[抽奖]/.test(description)) continue;
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
                /* 判断是否关注过 */
                const isFollowed = (new RegExp(uid)).test(self.attentionList);
                if (this.isAttentionErr && !isFollowed) continue;
                /* 判断是否转发过 */
                const isRelay = (new RegExp(dyid)).test(self.AllMyLotteryInfo);
                /* 获取黑名单并去重合并 */
                const { blacklist: remote_blacklist } = GlobalVar.remoteconfig;
                const new_blacklist = remote_blacklist ?
                    Array.from(new Set([...blacklist.split(','), ...remote_blacklist.split(',')])).toString() : blacklist;
                /* 进行判断 */
                if ((new RegExp(dyid + '|' + uid)).test(new_blacklist)) continue;
                onelotteryinfo.uid = [] /**初始化待关注列表 */
                if (!isFollowed) onelotteryinfo.uid.push(uid);
                if (!isRelay) {
                    onelotteryinfo.dyid = dyid;
                    const RandomStr = Base.getRandomStr(config.relay);
                    if (type === 1) {
                        /* 转发内容长度+'//'+'@'+用户名+':'+源内容 */
                        const addlength = RandomStr.length + 2 + uname.length + 1 + 1;
                        onelotteryinfo.relay_chat = RandomStr + `//@${uname}:` + des;
                        let new_ctrl = ctrl.map(item => {
                            item.location += addlength;
                            return item;
                        })
                        new_ctrl.unshift({
                            data: String(uid),
                            location: RandomStr.length + 2,
                            length: uname.length + 1,
                            type: 1
                        })
                        onelotteryinfo.ctrl = JSON.stringify(new_ctrl);
                        if (!(new RegExp(uids[1])).test(self.attentionList)) onelotteryinfo.uid.push(uids[1]);
                    } else {
                        onelotteryinfo.relay_chat = RandomStr;
                        onelotteryinfo.ctrl = '[]'
                    }
                }
                /* 根据动态的类型决定评论的类型 */
                onelotteryinfo.type = type === 2 ?
                    11 : type === 4 || type === 1 ?
                        17 : type === 8 ?
                            1 : 0;
                /* 是否评论 */
                if (isSendChat) onelotteryinfo.rid = rid;
                if (typeof onelotteryinfo.uid === 'undefined' && typeof onelotteryinfo.dyid === 'undefined') continue;
                alllotteryinfo.push(onelotteryinfo);
            }
        }
        return alllotteryinfo;
    }
    /**
     * 关注转发评论
     * @param {LotteryOptions} option
     * @returns {Promise<number>} sucess:1 err:0
     */
    async go(option) {
        const { uid, dyid, type, rid, relay_chat, ctrl } = option;
        if (typeof dyid === 'string') {
            if (typeof rid === 'string' && type !== 0) {
                if (await BiliAPI.sendChat(rid, Base.getRandomStr(config.chat), type) === 0) return 0;
            }
            if (!this.isAttentionErr) {
                uid.forEach(async (one_uid) => {
                    if (typeof one_uid === 'number') {
                        if (await BiliAPI.autoAttention(uid) === 0) {
                            this.isAttentionErr = true;
                            return
                        }
                        await Base.delay(5000);
                        if (await BiliAPI.movePartition(uid, this.tagid) === 0) {
                            this.isAttentionErr = true;
                            return
                        }
                    }
                })
            }
            if (this.isAttentionErr && uid.length !== 0) return 0;
            if (await BiliAPI.autoRelay(GlobalVar.myUID, dyid, relay_chat, ctrl) === 0) return 0;
            if (await MyStorage.updateDyid((Array.from(new Set([dyid, ...this.AllMyLotteryInfo.split(',')]))).toString()) === -1) return 0;
            if (await BiliAPI.autolike(dyid) === 0) return 0;
            await Base.delay(Number(config.wait) + Math.floor(Math.random() * 60000 - 30000));
        }
        return 1
    }
}

module.exports = Monitor;