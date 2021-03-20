const Base = require('./Base');
const BiliAPI = require('./BiliAPI');
/**
 * 基础功能
 */
class Public {
    constructor() { }
    /**
     * 提取出的有用动态信息
     * @typedef {object} UsefulDynamicInfo
     * @property {number} uid
     * @property {string} uname
     * @property {boolean} official_verify
     * @property {number} createtime
     * @property {string} rid_str
     * @property {string} dynamic_id
     * @property {number} type
     * @property {string} description
     * @property {boolean} hasOfficialLottery
     * @property {Array<Object.<string,string|number>>} ctrl
     * 
     * @property {number} origin_uid
     * @property {string} origin_uname
     * @property {boolean} origin_official_verify
     * @property {string} origin_rid_str
     * @property {string} origin_dynamic_id
     * @property {number} orig_type
     * @property {string} origin_description
     * @property {boolean} origin_hasOfficialLottery
     */
    /**
     * 检查所有的动态信息
     * @param {string} UID 指定的用户UID
     * @param {number} pages 读取页数
     * @param {number} time 时延
     * @param {string} [_offset] 默认'0'
     * @returns {Promise<{allModifyDynamicResArray: UsefulDynamicInfo[];offset: string}>} 获取前 `pages*12` 个动态信息
     */
    async checkAllDynamic(hostuid, pages, time = 0, _offset = '0') {
        console.log(`准备读取${pages}页自己的动态信息`);
        const mDR = this.modifyDynamicRes,
            getOneDynamicInfoByUID = BiliAPI.getOneDynamicInfoByUID,
            curriedGetOneDynamicInfoByUID = Base.curryify(getOneDynamicInfoByUID); /* 柯里化的请求函数 */
        /**
         * 储存了特定UID的请求函数
         */
        let hadUidGetOneDynamicInfoByUID = curriedGetOneDynamicInfoByUID(hostuid);
        /**
         * 储存所有经过整理后信息
         * [{}{}...{}]
         */
        let allModifyDynamicResArray = [];
        let offset = _offset;
        for (let i = 0; i < pages; i++) {
            console.log(`正在读取第${i + 1}页动态`);
            let OneDynamicInfo = await hadUidGetOneDynamicInfoByUID(offset);
            const mDRdata = mDR(OneDynamicInfo);
            if (mDRdata === null) {
                break;
            }
            /**
             * 储存一片动态信息
             * [{}{}...{}]
             */
            const mDRArry = mDRdata.modifyDynamicResArray,
                nextinfo = mDRdata.nextinfo;
            if (nextinfo.has_more === 0) {
                offset = nextinfo.next_offset;
                console.log(`成功读取${i + 1}页信息(已经是最后一页了故无法读取更多)`);
                break;
            } else {
                allModifyDynamicResArray.push.apply(allModifyDynamicResArray, mDRArry);
                i + 1 < pages ? console.log(`开始读取第${i + 2}页动态信息`) : console.log(`${pages}页信息全部成功读取完成`);
                offset = nextinfo.next_offset;
            }
            await Base.delay(time);
        }
        return ({ allModifyDynamicResArray, offset });
    }
    /**
     * 互动抽奖  
     * 处理来自动态页面的数据
     * @param {String} res
     * @returns {{modifyDynamicResArray: UsefulDynamicInfo[];nextinfo: {has_more: number;next_offset: string;};} | null}
     */
    modifyDynamicRes(res) {
        const strToJson = Base.strToJson,
            jsonRes = strToJson(res),
            { data } = jsonRes;
        if (jsonRes.code !== 0) {
            console.warn('获取动态数据出错,可能是访问太频繁');
            return null;
        }
        /* 字符串防止损失精度 */
        const offset = typeof data.offset === 'string' ? data.offset : /(?<=next_offset":)[0-9]*/.exec(res)[0]
            , next = {
                has_more: data.has_more,
                next_offset: offset
            };
        /**
         * 储存获取到的一组动态中的信息
         */
        let array = [];
        if (next.has_more === 0) {
            console.log('动态数据读取完毕');
        } else {
            /**
             * 空动态无cards
             */
            const Cards = data.cards;
            Cards.forEach(onecard => {
                /**临时储存单个动态中的信息 */
                let obj = {};
                const { desc, card } = onecard
                    , { info, card: user_profile_card } = desc.user_profile
                    , { official_verify } = user_profile_card
                    , cardToJson = strToJson(card);
                obj.uid = info.uid; /* 转发者的UID */
                obj.uname = info.uname;/* 转发者的name */
                obj.official_verify = official_verify.type > -1 ? true : false; /* 是否官方号 */
                obj.createtime = desc.timestamp /* 动态的ts10 */
                obj.type = desc.type /* 动态类型 */
                obj.rid_str = desc.rid_str.length > 12 ? desc.dynamic_id_str : desc.rid_str;/* 用于发送评论 */
                obj.orig_type = desc.orig_type /* 源动态类型 */
                obj.dynamic_id = desc.dynamic_id_str; /* 转发者的动态ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
                const { extension, extend_json } = onecard;
                obj.ctrl = (typeof extend_json === 'undefined') ? [] : strToJson(extend_json).ctrl || []; /* 定位@信息 */
                obj.hasOfficialLottery = (typeof extension === 'undefined') ? false : typeof extension.lott === 'undefined' ? false : true; /* 是否有官方抽奖 */
                const item = cardToJson.item || {};
                obj.description = item.content || item.description || ''; /* 转发者的描述 */
                if (obj.type === 1) {
                    obj.origin_uid = desc.origin.uid; /* 被转发者的UID */
                    obj.origin_rid_str = desc.origin.rid_str.length > 12 ? desc.origin.dynamic_id_str : desc.origin.rid_str; /* 被转发者的rid(用于发评论) */
                    obj.origin_dynamic_id = desc.orig_dy_id_str; /* 被转发者的动态的ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
                    const { origin_extension, origin_user } = cardToJson;
                    try {
                        obj.origin_official_verify = typeof origin_user === 'undefined' ?
                            false : origin_user.card.official_verify.type < 0 ?
                                false : true; /* 是否官方号 */
                    } catch (error) {
                        obj.origin_official_verify = false;
                    }
                    obj.origin_hasOfficialLottery = typeof origin_extension === 'undefined' ?
                        false : typeof origin_extension.lott === 'undefined' ?
                            false : true; /* 是否有官方抽奖 */
                    const origin = cardToJson.origin || '{}';
                    const { user, item } = strToJson(origin);
                    obj.origin_uname = typeof user === 'undefined' ? '' : user.name || user.uname || ''; /* 被转发者的name */
                    obj.origin_description = typeof item === 'undefined' ? '' : item.content || item.description || ''; /* 被转发者的描述 */
                }
                array.push(obj);
            });
        }
        return {
            modifyDynamicResArray: array,
            nextinfo: next
        };
    }
    /**
     * @typedef {object} LotteryInfo
     * @property {string} lottery_info_type
     * @property {number[]} uids `[uid,ouid]`
     * @property {string} uname
     * @property {Array<{}>} ctrl
     * @property {string} dyid
     * @property {boolean} befilter
     * @property {boolean} official_verify 官方认证
     * @property {string} rid
     * @property {string} des
     * @property {number} type
     * @property {boolean} hasOfficialLottery 是否官方
     */
    /**
     * 获取tag下的抽奖信息(转发母动态)  
     * 并初步整理
     * @param {string} tag_name
     * @returns {Promise<LotteryInfo[] | null>}
     */
    async getLotteryInfoByTag(tag_name) {
        const self = this,
            tag_id = await BiliAPI.getTagIDByTagName(tag_name),
            hotdy = await BiliAPI.getHotDynamicInfoByTagID(tag_id),
            modDR = self.modifyDynamicRes(hotdy);
        if (modDR === null) return null;
        console.log(`开始获取带话题#${tag_name}#的动态信息`);
        console.log('成功获取热门动态');
        let mDRdata = modDR.modifyDynamicResArray; /* 热门动态 */
        let next_offset = modDR.nextinfo.next_offset;
        for (let index = 0; index < 3; index++) {
            console.log(`成功读取${index + 1}页动态`);
            const newdy = await BiliAPI.getOneDynamicInfoByTag(tag_name, next_offset);
            const _modify = self.modifyDynamicRes(newdy);
            if (_modify === null) return null;
            mDRdata.push.apply(mDRdata, _modify.modifyDynamicResArray);
            next_offset = _modify.nextinfo.next_offset;
        }
        const fomatdata = mDRdata.map(o => {
            const hasOrigin = o.type === 1;
            return {
                lottery_info_type: 'tag',
                uids: [o.uid, o.origin_uid],
                uname: o.uname,
                ctrl: o.ctrl,
                dyid: o.dynamic_id,
                official_verify: o.official_verify,
                befilter: hasOrigin,
                rid: o.rid_str,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            };
        })
        console.log(`成功获取带话题#${tag_name}#的动态信息`);
        return fomatdata
    }
    /**
     * 获取最新动态信息(转发子动态)  
     * 并初步整理
     * @param {string} UID
     * @returns {Promise<LotteryInfo[] | null>}
     */
    async getLotteryInfoByUID(UID) {
        console.log(`开始获取用户${UID}的动态信息`);
        const { allModifyDynamicResArray: aMDRA } = await this.checkAllDynamic(UID, 3, 500);
        if (!aMDRA.length) return null;
        const fomatdata = aMDRA.map(o => {
            return {
                lottery_info_type: 'uid',
                uids: [o.uid, o.origin_uid],
                uname: o.origin_uname,
                ctrl: [],
                dyid: o.origin_dynamic_id,
                official_verify: o.origin_official_verify,
                befilter: false,
                rid: o.origin_rid_str,
                des: o.origin_description,
                type: o.orig_type,
                hasOfficialLottery: o.origin_hasOfficialLottery
            }
        }).filter(a => a.type === 0 ? false : true)
        console.log(`成功获取用户${UID}的动态信息`);
        return fomatdata;
    }
}

module.exports = Public;
