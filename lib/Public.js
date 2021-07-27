const Util = require('./Util');
const BiliAPI = require('./BiliAPI');
const config = require("./config");
const MyStorage = require('./MyStorage');

const { log } = Util

/**
 * 解析dynamic_detail_card
 * 提取出的有用动态信息
 * @typedef {object} UsefulDynamicInfo
 * @property {number} uid
 * @property {string} uname
 * @property {number} createtime 10
 * @property {string} rid_str
 * @property {string} dynamic_id
 * @property {number} type
 * @property {string} description
 * @property {boolean} hasOfficialLottery
 * @property {Array<Object.<string,string|number>>} ctrl
 * 
 * @property {number} origin_uid
 * @property {string} origin_uname
 * @property {string} origin_rid_str
 * @property {string} origin_dynamic_id
 * @property {number} orig_type
 * @property {string} origin_description
 * @property {boolean} origin_hasOfficialLottery
 * 
 * @param {object} dynamic_detail_card
 * @return {UsefulDynamicInfo}
 */
function parseDynamicCard(dynamic_detail_card) {
    const { strToJson } = Util;
    /**临时储存单个动态中的信息 */
    let obj = {};
    const { desc, card, extension, extend_json } = dynamic_detail_card
        , { info } = desc.user_profile
        , cardToJson = strToJson(card)
        , { item } = cardToJson;
    /* 转发者的UID */
    obj.uid = info.uid;
    /* 转发者的name */
    obj.uname = info.uname;
    /* 动态的ts10 */
    obj.createtime = desc.timestamp
    /* 动态类型 */
    obj.type = desc.type
    /* 用于发送评论 */
    obj.rid_str = desc.rid_str.length > 12 ? desc.dynamic_id_str : desc.rid_str;
    /* 源动态类型 */
    obj.orig_type = desc.orig_type
    /* 转发者的动态ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
    obj.dynamic_id = desc.dynamic_id_str;
    /* 定位@信息 */
    obj.ctrl = (extend_json && strToJson(extend_json).ctrl) || [];
    /* 是否有官方抽奖 */
    obj.hasOfficialLottery = extension && extension.lott && true;
    /* 转发者的描述 后两个分别是视频动态的描述和视频本身的描述*/
    obj.description = (item && (item.content || item.description || cardToJson.dynamic || cardToJson.desc)) || '';
    if (obj.type === 1) {
        const { origin_extension, origin } = cardToJson
            , originToJson = strToJson(origin)
            , { user, item } = originToJson;
        /* 被转发者的UID */
        obj.origin_uid = desc.origin.uid;
        /* 被转发者的rid(用于发评论) */
        obj.origin_rid_str = desc.origin.rid_str.length > 12 ? desc.origin.dynamic_id_str : desc.origin.rid_str;
        /* 被转发者的动态的ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
        obj.origin_dynamic_id = desc.orig_dy_id_str;
        /* 是否有官方抽奖 */
        obj.origin_hasOfficialLottery = origin_extension && origin_extension.lott;
        /* 被转发者的name */
        obj.origin_uname = (user && (user.name || user.uname)) || '';
        /* 被转发者的描述 */
        obj.origin_description = (item && (item.content || item.description || originToJson.dynamic || originToJson.desc)) || '';
    }

    return obj
}

/**
 * 处理来自个人动态或话题页面的一组动态数据
 * @param {String} res
 * @returns {{modifyDynamicResArray: UsefulDynamicInfo[], nextinfo: {has_more: number, next_offset: string}} | UsefulDynamicInfo |null}
 */
function modifyDynamicRes(res) {
    const
        strToJson = Util.strToJson
        , { data, code } = strToJson(res)
        , { cards = [], has_more, offset } = data;

    if (code !== 0) {
        log.error('处理动态数据', '获取动态数据出错,可能是访问太频繁 \n' + res);
        return null;
    }

    if (!cards.length) {
        log.warn('处理动态数据', '未找到任何动态信息')
    }

    const
        /**
         * 字符串offset防止损失精度
         */
        next = {
            has_more,
            next_offset: typeof offset === 'string'
                ? offset
                : /(?<=next_offset":)[0-9]+/.exec(res)[0]
        },
        /**
         * 储存获取到的一组动态中的信息
         */
        array = next.has_more === 0
            ? []
            : cards.map(onecard => parseDynamicCard(onecard))

    log.info('处理动态数据', `动态数据读取完毕(${cards.length})(${next.has_more})`);

    return {
        modifyDynamicResArray: array,
        nextinfo: next
    }
}

/**
 * 基础功能
 */
class Public {
    constructor() { }
    /**
     * 整理后的抽奖信息
     * @typedef {object} LotteryInfo
     * @property {string} lottery_info_type
     * @property {number[]} uids `[uid,ouid]`
     * @property {string} uname
     * @property {Array<{}>} ctrl
     * @property {string} dyid
     * @property {string} rid
     * @property {string} des
     * @property {number} type
     * @property {boolean} hasOfficialLottery 是否官方
     */
    /**
     * 检查指定用户的所有的动态信息
     * @param {string} UID 指定的用户UID
     * @param {number} pages 读取页数
     * @param {number} time 时延
     * @param {string} [offset] 默认'0'
     * @returns {Promise<{allModifyDynamicResArray: UsefulDynamicInfo[], offset: string}>} 获取前 `pages*12` 个动态信息
     */
    async checkAllDynamic(hostuid, pages, time = 0, offset = '0') {
        log.info('检查所有动态', `准备读取${pages}页动态`);

        const { getOneDynamicInfoByUID } = BiliAPI,
            /**
             * 柯里化请求函数
             */
            curriedGetOneDynamicInfoByUID = Util.curryify(getOneDynamicInfoByUID),
            /**
             * 储存了特定UID的请求函数
             */
            hadUidGetOneDynamicInfoByUID = curriedGetOneDynamicInfoByUID(hostuid);

        /**
         * 储存所有经过整理后信息
         * @type { UsefulDynamicInfo[] }
         */
        let allModifyDynamicResArray = [];

        for (let i = 0; i < pages; i++) {
            log.info('检查所有动态', `正在读取其中第${i + 1}页动态`);

            const
                OneDynamicInfo = await hadUidGetOneDynamicInfoByUID(offset),
                mDRdata = modifyDynamicRes(OneDynamicInfo);

            if (mDRdata === null) {
                break;
            }

            const
                /**
                 * 一片动态
                 */
                mDRArry = mDRdata.modifyDynamicResArray,
                nextinfo = mDRdata.nextinfo;

            if (nextinfo.has_more === 0) {
                offset = nextinfo.next_offset;
                log.info('检查所有动态', `成功读取${i + 1}页信息(已经是最后一页了故无法读取更多)`);
                break;
            } else {
                /**合并 */
                allModifyDynamicResArray.push.apply(allModifyDynamicResArray, mDRArry);
                log.info('检查所有动态', `开始读取第${i + 2}页动态信息`)
                offset = nextinfo.next_offset;
            }

            await Util.delay(time);
        }

        log.info('检查所有动态', `第${pages}页信息读取完成`)

        return ({ allModifyDynamicResArray, offset });
    }
    /**
     * 获取最新动态信息(转发子动态)
     * 并初步整理
     * @param {string} UID
     * @returns {Promise<LotteryInfo[] | null>}
     */
    async getLotteryInfoByUID(UID) {
        log.info('获取动态', `开始获取用户${UID}的动态信息`);
        const { allModifyDynamicResArray } = await this.checkAllDynamic(UID, config.uid_scan_page, config.search_wait);

        if (!allModifyDynamicResArray.length) return null;

        const fomatdata = allModifyDynamicResArray.map(o => {
            return {
                lottery_info_type: 'uid',
                uids: [o.uid, o.origin_uid],
                uname: o.origin_uname,
                ctrl: [],
                dyid: o.origin_dynamic_id,
                rid: o.origin_rid_str,
                des: o.origin_description,
                type: o.orig_type,
                hasOfficialLottery: o.origin_hasOfficialLottery
            }
        }).filter(a => a.type != 0)
        log.info('获取动态', `成功获取用户${UID}的动态信息`);

        return fomatdata;
    }
    /**
     * 获取tag下的抽奖信息(转发母动态)  
     * 并初步整理
     * @param {string} tag_name
     * @returns {Promise<LotteryInfo[] | null>}
     */
    async getLotteryInfoByTag(tag_name) {
        const
            tag_id = await BiliAPI.getTagIDByTagName(tag_name),
            hotdy = await BiliAPI.getHotDynamicInfoByTagID(tag_id),
            modDR = modifyDynamicRes(hotdy);

        if (modDR === null) return null;

        log.info('获取动态', `开始获取带话题#${tag_name}#的动态信息`);
        log.info('获取动态', '成功获取热门动态');

        /**
         * 热门动态
         */
        let mDRdata = modDR.modifyDynamicResArray;
        let next_offset = modDR.nextinfo.next_offset;

        for (let index = 0; index < config.tag_scan_page; index++) {
            log.info('获取动态', `读取第${index + 1}页动态`);
            const
                newdy = await BiliAPI.getOneDynamicInfoByTag(tag_name, next_offset),
                _modify = modifyDynamicRes(newdy);

            if (_modify === null) return null;

            mDRdata.push.apply(mDRdata, _modify.modifyDynamicResArray);
            next_offset = _modify.nextinfo.next_offset;

            await Util.delay(config.search_wait);
        }
        const fomatdata = mDRdata.map(o => {
            return {
                lottery_info_type: 'tag',
                uids: [o.uid, o.origin_uid],
                uname: o.uname,
                ctrl: o.ctrl,
                dyid: o.dynamic_id,
                rid: o.rid_str,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            };
        })
        log.info('获取动态', `成功获取带话题#${tag_name}#的动态信息`);

        return fomatdata
    }
    /**
     * 从专栏中获取抽奖信息
     * @param {string} key_words
     * @returns {Promise<LotteryInfo[] | null>}
     */
    async getLotteryInfoByArticle(key_words) {
        log.info('获取动态', `开始获取含关键词${key_words}的专栏信息`);
        const cvs = (await BiliAPI.searchArticlesByKeyword(key_words)).slice(0, config.article_scan_page);

        let dyinfos = [];
        for (const cv of cvs) {
            const content = await BiliAPI.getOneArticleByCv(cv)
                , dyids = content.match(/(?<=t.bilibili.com\/)[0-9]+/g) || [];
            let { length } = dyids,
                /**判断此专栏是否查看过的权重 */
                weight = 8;
            log.info('获取动态', `提取专栏(${cv})中提及的dyid(${length})`)
            for (const dyid of dyids) {
                const isRelayed = await MyStorage.searchDyid(dyid);
                weight = isRelayed ? weight - 1 : 8;
                if (weight < 0) {
                    log.info('获取动态', '连续8条动态曾经转过,该专栏或已查看,故中止')
                    dyinfos = []
                    break
                }
                if (dyid.length === Util.dyid_length) {
                    if (!isRelayed) {
                        log.info('获取动态', `查看动态(${dyid})的细节 (${length--})`)
                        const res = await BiliAPI.getOneDynamicByDyid(dyid)
                            , { code, data } = Util.strToJson(res)
                            , { card } = data;

                        if (code !== 0) {
                            log.error('获取动态', '获取动态数据出错,可能是访问太频繁 \n' + res)
                            break
                        }

                        await Util.delay(2000)

                        if (card) {
                            dyinfos.push(parseDynamicCard(card));
                        }
                    } else {
                        log.info('获取动态', `动态(${dyid})已转发过 (${length--})`)
                    }
                } else {
                    log.warn('获取动态', `动态(${dyid})无效 (${length--})`)
                }
            }
        }
        const fomatdata = dyinfos.map(o => {
            return {
                lottery_info_type: 'article',
                uids: [o.uid, o.origin_uid],
                uname: o.uname,
                ctrl: o.ctrl,
                dyid: o.dynamic_id,
                rid: o.rid_str,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            };
        })
        log.info('获取动态', `成功获取含关键词${key_words}的专栏信息`);

        return fomatdata
    }
}


module.exports = Public;