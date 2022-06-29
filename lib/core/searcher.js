const utils = require('../utils');
const bili = require('../net/bili');
const { send } = require("../net/http");
const { check_if_duplicated, article_scan_page, article_create_time, not_check_article, get_dynamic_detail_wait, uid_scan_page, search_wait, tag_scan_page } = require("../data/config");
const d_storage = require("../helper/d_storage")

const { log } = utils

/**
 * 解析dynamic_detail_card
 * 提取出的有用动态信息
 * @typedef {object} UsefulDynamicInfo
 * @property {number} uid
 * @property {string} uname
 * @property {boolean} is_liked
 * @property {number} create_time 10
 * @property {string} rid_str
 * @property {string} dynamic_id
 * @property {number} type
 * @property {string} description
 * @property {number} reserve_id
 * @property {boolean} hasOfficialLottery
 * @property {Array<Object.<string,string|number>>} ctrl
 * @property {number} origin_create_time 10
 * @property {number} origin_uid
 * @property {string} origin_uname
 * @property {string} origin_rid_str
 * @property {string} origin_dynamic_id
 * @property {number} orig_type
 * @property {string} origin_description
 * @property {number} origin_reserve_id
 * @property {boolean} origin_hasOfficialLottery
 * 
 * 整理后的抽奖信息
 * @typedef {object} LotteryInfo
 * @property {string} lottery_info_type
 * @property {number} create_time
 * @property {boolean} is_liked
 * @property {number[]} uids `[uid,ouid]`
 * @property {string} uname
 * @property {Array<{}>} ctrl
 * @property {string} dyid
 * @property {number} reserve_id
 * @property {string} rid
 * @property {string} des
 * @property {number} type
 * @property {boolean} hasOfficialLottery 是否官方
 * 
 * @param {object} dynamic_detail_card
 * @return {UsefulDynamicInfo}
 */
function parseDynamicCard(dynamic_detail_card) {
    const { strToJson } = utils;
    /**临时储存单个动态中的信息 */
    let obj = {};
    const { desc, card, extension, extend_json } = dynamic_detail_card
        , { is_liked = 1, user_profile = {} } = desc
        , { info = {} } = user_profile
        , extendjsonToJson = strToJson(extend_json)
        , extendjsonToJsonHidden = extendjsonToJson[""] || {}
        , cardToJson = strToJson(card)
        , { item } = cardToJson;
    /* 转发者的UID */
    obj.uid = desc.uid
    /* 转发者的name */
    obj.uname = info.uname || ''
    /* 动态是否点过赞 */
    obj.is_liked = is_liked > 0
    /* 动态的ts10 */
    obj.create_time = desc.timestamp
    /* 动态类型 */
    obj.type = desc.type
    /* 用于发送评论 */
    obj.rid_str = desc.rid_str.length > 12 ? desc.dynamic_id_str : desc.rid_str;
    /* 源动态类型 */
    obj.orig_type = desc.orig_type
    /* 转发者的动态ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
    obj.dynamic_id = desc.dynamic_id_str;
    /* 定位@信息 */
    obj.ctrl = (extendjsonToJson.ctrl) || [];
    /* 预约抽奖信息 */
    if (extendjsonToJsonHidden.reserve) {
        let status = (((dynamic_detail_card || {})
            .display || {})
            .add_on_card_info || [])
            .map(it => (((it || {})
                .reserve_attach_card || {})
                .reserve_button || {})
                .status || 2)[0];
        if (status === 1) {
            let { reserve_id } = extendjsonToJsonHidden.reserve;
            obj.reserve_id = reserve_id || 0;
        }
    }
    /* 是否有官方抽奖 */
    obj.hasOfficialLottery = extension && extension.lott && true;
    /* 转发者的描述 纯文字内容 图片动态描述 后两个分别是视频动态的描述和视频本身的描述*/
    obj.description =
        (item && (item.content || '' + item.description || ''))
        || (cardToJson.dynamic || '' + cardToJson.desc || '')
        || '';
    if (obj.type === 1) {
        const { origin_extension, origin, origin_extend_json } = cardToJson
            , originToJson = strToJson(origin)
            , originextendjsonToJson = strToJson(origin_extend_json)
            , { user, item } = originToJson;
        /* 源动态的ts10 */
        obj.origin_create_time = desc.origin.timestamp;
        /* 被转发者的UID */
        obj.origin_uid = desc.origin.uid;
        /* 被转发者的rid(用于发评论) */
        obj.origin_rid_str = desc.origin.rid_str.length > 12 ? desc.origin.dynamic_id_str : desc.origin.rid_str;
        /* 被转发者的动态的ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
        obj.origin_dynamic_id = desc.orig_dy_id_str;
        /* 预约抽奖信息 */
        if (originextendjsonToJson.reserve) {
            let { reserve_id, reserve_lottery } = originextendjsonToJson.reserve;
            obj.origin_reserve_id = reserve_lottery === 1 ? reserve_id : 0;
        }
        /* 是否有官方抽奖 */
        obj.origin_hasOfficialLottery = origin_extension && origin_extension.lott;
        /* 被转发者的name */
        obj.origin_uname = (user && (user.name || user.uname)) || '';
        /* 被转发者的描述 */
        obj.origin_description =
            (item && (item.content || '' + item.description || ''))
            || (originToJson.dynamic || '' + originToJson.desc || '')
            || '';
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
        { data, code } = utils.strToJson(res),
        { cards = [], has_more, offset } = data || {};

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
            : cards.map(parseDynamicCard)

    log.info('处理动态数据', `动态数据读取完毕(${cards.length})(${next.has_more})`);

    return {
        modifyDynamicResArray: array,
        nextinfo: next
    }
}

/**
 * 基础搜索功能
 */
class Searcher {
    constructor() { }
    /**
     * 检查指定用户的所有的动态信息
     * @param {number} hostuid 指定的用户UID
     * @param {number} pages 读取页数
     * @param {number} time 时延
     * @param {string} [offset] 默认'0'
     * @returns {Promise<{allModifyDynamicResArray: UsefulDynamicInfo[], offset: string} | null>} 获取前 `pages*12` 个动态信息
     */
    static async checkAllDynamic(hostuid, pages, time = 0, offset = '0') {
        log.info('检查所有动态', `准备读取${pages}页动态`);

        const { getOneDynamicInfoByUID } = bili,
            /**
             * 柯里化请求函数
             */
            curriedGetOneDynamicInfoByUID = utils.curryify(getOneDynamicInfoByUID),
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
                return null
            }

            const
                /**
                 * 一片动态
                 */
                mDRArry = mDRdata.modifyDynamicResArray,
                nextinfo = mDRdata.nextinfo;

            if (nextinfo.has_more === 0) {
                offset = nextinfo.next_offset;
                log.info('检查所有动态', `已经是最后一页了故无法读取更多`);
                break;
            } else {
                /**合并 */
                allModifyDynamicResArray.push.apply(allModifyDynamicResArray, mDRArry);
                offset = nextinfo.next_offset;
            }

            await utils.delay(time);
        }

        log.info('检查所有动态', `${pages}页信息读取完成`)

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
        const { allModifyDynamicResArray } = await Searcher.checkAllDynamic(UID, uid_scan_page, search_wait);

        let { length } = allModifyDynamicResArray

        if (!length) return null;

        const fomatdata = await allModifyDynamicResArray
            .filter(d => {
                if (d.type === 1) {
                    return true
                } else {
                    length--
                    return false
                }
            })
            .reduce(async (pre, cur) => {
                let
                    results = await pre,
                    { origin_dynamic_id } = cur,
                    is_liked = false;

                if (!check_if_duplicated || check_if_duplicated === 2) {
                    const card = await bili.getOneDynamicByDyid(origin_dynamic_id)
                    log.info('获取动态', `查看源动态(${origin_dynamic_id})是否点赞 (${length--})`)
                    if (card) {
                        ({ is_liked } = parseDynamicCard(card))
                    }
                    await utils.delay(get_dynamic_detail_wait)
                }

                results.push({
                    lottery_info_type: 'uid',
                    create_time: cur.origin_create_time,
                    is_liked,
                    uids: [cur.uid, cur.origin_uid],
                    uname: cur.origin_uname,
                    ctrl: [],
                    dyid: cur.origin_dynamic_id,
                    reserve_id: cur.origin_reserve_id,
                    rid: cur.origin_rid_str,
                    des: cur.origin_description,
                    type: cur.orig_type,
                    hasOfficialLottery: cur.origin_hasOfficialLottery
                })

                return results
            }, Promise.resolve([]))

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
            tag_id = await bili.getTagIDByTagName(tag_name),
            hotdy = await bili.getHotDynamicInfoByTagID(tag_id),
            modDR = modifyDynamicRes(hotdy);

        if (modDR === null) return null;

        log.info('获取动态', `开始获取带话题#${tag_name}#的动态信息`);
        log.info('获取动态', '成功获取热门动态');

        /**
         * 热门动态
         */
        let mDRdata = modDR.modifyDynamicResArray;
        let next_offset = modDR.nextinfo.next_offset;

        for (let index = 0; index < tag_scan_page; index++) {
            log.info('获取动态', `读取第${index + 1}页动态`);
            const
                newdy = await bili.getOneDynamicInfoByTag(tag_name, next_offset),
                _modify = modifyDynamicRes(newdy);

            if (_modify === null) return null;

            mDRdata.push.apply(mDRdata, _modify.modifyDynamicResArray);
            next_offset = _modify.nextinfo.next_offset;

            await utils.delay(search_wait);
        }
        const fomatdata = mDRdata.map(o => {
            return {
                lottery_info_type: 'tag',
                create_time: o.create_time,
                is_liked: o.is_liked,
                uids: [o.uid, o.origin_uid],
                uname: o.uname,
                ctrl: o.ctrl,
                dyid: o.dynamic_id,
                reserve_id: o.reserve_id,
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
        const cvs = (await bili.searchArticlesByKeyword(key_words)).slice(0, article_scan_page);

        /**存储所有专栏中的dyid */
        let dyinfos = [];
        /**遍历专栏s */
        for (const { id, pub_time } of cvs) {
            let now_time = Math.floor(Date.now() / 1000);
            if ((now_time - pub_time) / 86400 > article_create_time) {
                log.warn("获取动态", `该专栏(${id})创建时间大于设定天数(${article_create_time}天)`)
                continue
            }
            const
                content = await bili.getOneArticleByCv(id),
                dyids = content.match(/(?<=t.bilibili.com\/)[0-9]+/g) || [],
                dyids_set = [...new Set(dyids)],
                /**判断此专栏是否查看过的权重 */
                weight = dyids_set.length / 2;

            let { length } = dyids_set,
                /**初始权重 */
                _weight = 0,
                /**单个专栏中的dyid */
                _dyinfos = [];
            log.info('获取动态', `提取专栏(${id})中提及的dyid(${length})`)

            /**遍历某专栏中的dyids */
            for (const dyid of dyids_set) {
                if (dyid.length === utils.dyid_length) {

                    log.info('获取动态', `查看专栏中所提及动态(${dyid}) (${length--})`)
                    const card = await bili.getOneDynamicByDyid(dyid)

                    if (card) {
                        await utils.delay(get_dynamic_detail_wait)

                        const parsed_card = parseDynamicCard(card)
                            , { is_liked } = parsed_card;

                        if (
                            ((!check_if_duplicated || check_if_duplicated === 2)
                                && is_liked)
                            || ((check_if_duplicated === 1 || check_if_duplicated === 2)
                                && await d_storage.searchDyid(dyid))
                        ) {
                            log.info('获取动态', `动态(${dyid})已转发过`)
                            _weight += 1;
                        }

                        if (_weight >= weight && !not_check_article) {
                            log.warn('获取动态', `1/2动态曾经转过,该专栏或已查看,故中止`)
                            _dyinfos = []
                            break
                        }

                        _dyinfos.push(parsed_card);
                    }
                } else {
                    log.warn('获取动态', `动态(${dyid})无效 (${length--})`)
                }
            }
            dyinfos.push(..._dyinfos)
        }
        const fomatdata = dyinfos.map(o => {
            return {
                lottery_info_type: 'article',
                create_time: o.create_time,
                is_liked: o.is_liked,
                uids: [o.uid, o.origin_uid],
                uname: o.uname,
                ctrl: o.ctrl,
                dyid: o.dynamic_id,
                reserve_id: o.reserve_id,
                rid: o.rid_str,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            };
        })
        log.info('获取动态', `成功获取含关键词${key_words}的专栏信息`);

        return fomatdata
    }

    /**
     * 从特定格式的api响应数据中获取抽奖信息
     * @param {string} api
     * @returns {Promise<LotteryInfo[] | null>}
     */
    getLotteryInfoByAPI(api) {
        return new Promise((resolve) => {
            if (api) {
                const { strToJson } = utils;
                log.info('获取动态', `开始获取链接(${api})中的抽奖信息`)
                send({
                    url: api,
                    config: {
                        redirect: true
                    },
                    method: 'GET',
                    success: ({ body }) => {
                        if (body.err_msg) {
                            log.error("从API响应数据中获取抽奖信息", body.err_msg)
                            resolve(null)
                        } else {
                            const raw_lottery_info = strToJson(body).lottery_info;

                            if (raw_lottery_info) {
                                let { length } = raw_lottery_info;
                                if (length) {
                                    const lottery_info = raw_lottery_info
                                        .reduce(async (pre, cur) => {
                                            let results = await pre
                                                , { dyid } = cur;

                                            if (!check_if_duplicated || check_if_duplicated === 2) {
                                                log.info('获取动态', `查看动态(${dyid})是否点赞 (${length--})`)
                                                const card = await bili.getOneDynamicByDyid(dyid)

                                                if (card) {
                                                    await utils.delay(get_dynamic_detail_wait)

                                                    const { is_liked } = parseDynamicCard(card)

                                                    if (is_liked) {
                                                        log.info('获取动态', `动态(${dyid})已转发过`)
                                                    } else {
                                                        cur.is_liked = is_liked
                                                        results.push(cur)
                                                    }
                                                }
                                            } else {
                                                results.push(cur)
                                            }

                                            return results

                                        }, Promise.resolve([]))

                                    resolve(lottery_info)
                                    return
                                }
                            }
                            log.error("从API响应数据中获取抽奖信息", "非Json数据或没有lottery_info或lottery为空")
                            resolve(null)
                        }
                    },
                    failure: err => {
                        log.error("从API响应数据中获取抽奖信息", err)
                        resolve(null)
                    }
                })
            } else {
                log.warn('获取动态', `链接为空`)
                resolve(null)
            }
        });
    }
}


module.exports = { Searcher };
