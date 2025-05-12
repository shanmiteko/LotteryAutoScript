const utils = require('../utils');
const bili = require('../net/bili');
const { send } = require('../net/http');
const { check_if_duplicated, article_scan_page, article_create_time, not_check_article, get_dynamic_detail_wait, uid_scan_page, search_wait, tag_scan_page } = require('../data/config');
const d_storage = require('../helper/d_storage');

const { log } = utils;

/**
 * 解析dynamic_detail_card
 * 提取出的有用动态信息
 * @typedef {object} UsefulDynamicInfo
 * @property {number} uid
 * @property {string} uname
 * @property {boolean} is_liked
 * @property {number} create_time 10
 * @property {string} rid_str
 * @property {number} chat_type
 * @property {string} dynamic_id
 * @property {number} type
 * @property {string} description
 * @property {string} reserve_id
 * @property {string} reserve_lottery_text
 * @property {boolean} is_charge_lottery
 * @property {boolean} hasOfficialLottery
 * @property {Array<Object.<string,string|number>>} ctrl
 * @property {number} origin_create_time 10
 * @property {number} origin_uid
 * @property {string} origin_uname
 * @property {string} origin_rid_str
 * @property {number} origin_chat_type
 * @property {string} origin_dynamic_id
 * @property {number} origin_type
 * @property {string} origin_description
 * @property {string} origin_reserve_id
 * @property {string} origin_reserve_lottery_text
 * @property {boolean} origin_is_charge_lottery
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
 * @property {string} reserve_id
 * @property {string} reserve_lottery_text
 * @property {boolean} is_charge_lottery
 * @property {string} rid
 * @property {number} chat_type
 * @property {string} des
 * @property {number} type
 * @property {boolean} hasOfficialLottery 是否官方
 * 
 * @param {object} data
 * @return {UsefulDynamicInfo}
 */
function parseDynamicCard(data) {
    if (data?.card?.desc?.uid) {
        return oldParseDynamicCard(data?.card);
    }

    // 如果是多个 items，返回一个数组
    if (Array.isArray(data?.items)) {
        return data.items.map(item => parseDynamicCard({ item }));
    }

    let ditem = data?.item;
    /**临时储存单个动态中的信息 */
    let obj = {};
    try {
        const dy_typeenum2num = new Map([
            ['DYNAMIC_TYPE_FORWARD', 1],
            ['DYNAMIC_TYPE_DRAW', 2],
            ['DYNAMIC_TYPE_WORD', 4],
            ['DYNAMIC_TYPE_AV', 8],
            ['DYNAMIC_TYPE_ARTICLE', 64]
        ]);
        const dy_type2chat_type = new Map([
            ['DYNAMIC_TYPE_FORWARD', 17],
            ['DYNAMIC_TYPE_DRAW', 11],
            ['DYNAMIC_TYPE_WORD', 17],
            ['DYNAMIC_TYPE_AV', 1],
            ['DYNAMIC_TYPE_ARTICLE', 12]
        ]);
        /* 转发者的UID */
        obj.uid = ditem?.modules?.module_author?.mid || 0;
        /* 转发者的name */
        obj.uname = ditem?.modules?.module_author?.name || '';
        /* 动态是否点过赞 */
        obj.is_liked = ditem?.modules?.module_stat?.like?.status || false;
        /* 动态的ts10 */
        obj.create_time = ditem?.modules?.module_author?.pub_ts || 0;
        /* 动态类型 */
        obj.type = dy_typeenum2num.get(ditem?.type) || 0;
        /* 用于发送评论 */
        obj.rid_str = ditem?.basic?.comment_id_str || '';
        /* 用于发送评论 */
        obj.chat_type = ditem?.basic?.comment_type || 0;
        /* 转发者的动态ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
        obj.dynamic_id = ditem?.id_str || '';
        /* 定位@信息 */
        obj.ctrl = [];
        /* 是否有官方抽奖 */
        obj.hasOfficialLottery = false;
        /* 转发描述 */
        obj.description = '';
        let _total_len = 0;
        if (Array.isArray(ditem?.modules?.module_dynamic?.desc?.rich_text_nodes)) {
            ditem?.modules?.module_dynamic?.desc?.rich_text_nodes.forEach(node => {
                if (node.type === 'RICH_TEXT_NODE_TYPE_AT') {
                    obj.ctrl.push({
                        data: node.rid,
                        location: _total_len,
                        length: node.text.length,
                        type: 1
                    });
                }
                /* 是否有官方抽奖 */
                if (node.type === 'RICH_TEXT_NODE_TYPE_LOTTERY') {
                    obj.hasOfficialLottery = true;
                }
                obj.description += node.orig_text;
                _total_len += node.text.length;
            });
        } else {
            ditem?.modules?.module_dynamic?.major?.opus?.summary?.rich_text_nodes.forEach(node => {
                if (node.type === 'RICH_TEXT_NODE_TYPE_AT') {
                    obj.ctrl.push({
                        data: node.rid,
                        location: _total_len,
                        length: node.text.length,
                        type: 1
                    });
                }
                /* 是否有官方抽奖 */
                if (node.type === 'RICH_TEXT_NODE_TYPE_LOTTERY') {
                    obj.hasOfficialLottery = true;
                }
                obj.description += node.orig_text;
                _total_len += node.text.length;
            });
        }
        /* 预约抽奖信息 */
        obj.reserve_id = ditem?.modules?.module_dynamic?.additional?.reserve?.rid || 0;
        obj.reserve_lottery_text = ditem?.modules?.module_dynamic?.additional?.reserve?.title || '信息丢失';
        /* 充电抽奖 */
        if (ditem?.modules?.module_dynamic?.additional?.type === 'ADDITIONAL_TYPE_UPOWER_LOTTERY') {
            obj.is_charge_lottery = true;
        }
        /* 转发 */
        if (obj.type === 1) {
            /* 被转发者的UID */
            obj.origin_uid = ditem?.orig?.modules?.module_author?.mid || 0;
            /* 被转发者的name */
            obj.origin_uname = ditem?.orig?.modules?.module_author?.name || '';
            /* 源动态的ts10 */
            obj.origin_create_time = ditem?.orig?.modules?.module_author?.pub_ts || 0;
            /* 源动态类型 */
            obj.origin_type = dy_typeenum2num.get(ditem?.orig?.type) || 0;
            /* 被转发者的rid(用于发评论) */
            switch (ditem?.orig?.type) {
                case 'DYNAMIC_TYPE_DRAW':
                    obj.origin_rid_str = ditem?.orig?.modules?.module_dynamic?.major?.draw?.id?.toString() || '';
                    break;
                case 'DYNAMIC_TYPE_AV':
                    obj.origin_rid_str = ditem?.orig?.modules?.module_dynamic?.major?.archive?.aid || '';
                    break;
                case 'DYNAMIC_TYPE_ARTICLE':
                    obj.origin_rid_str = ditem?.orig?.modules?.module_dynamic?.major?.article?.id?.toString() || '';
                    break;
                default:
                    obj.origin_rid_str = ditem?.orig?.id_str || '';
                    break;
            }
            /* 用于发送评论 */
            obj.origin_chat_type = dy_type2chat_type.get(ditem?.orig?.type) || 0;
            /* 被转发者的动态的ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
            obj.origin_dynamic_id = ditem?.orig?.id_str || '';
            /* 预约抽奖信息 */
            obj.origin_reserve_id = ditem?.orig?.modules?.module_dynamic?.additional?.reserve?.rid || 0;
            obj.origin_reserve_lottery_text = ditem?.orig?.modules?.module_dynamic?.additional?.reserve?.title || '信息丢失';
            /* 充电抽奖 */
            if (ditem?.orig?.modules?.module_dynamic?.additional?.type === 'ADDITIONAL_TYPE_UPOWER_LOTTERY') {
                obj.origin_is_charge_lottery = true;
            }
            /* 是否有官方抽奖 */
            obj.origin_hasOfficialLottery = false;
            /* 转发描述 */
            obj.origin_description = '';
            if (Array.isArray(ditem?.orig?.modules?.module_dynamic?.desc?.rich_text_nodes)) {
                ditem?.orig?.modules?.module_dynamic?.desc?.rich_text_nodes.forEach(node => {
                    /* 是否有官方抽奖 */
                    if (node.type === 'RICH_TEXT_NODE_TYPE_LOTTERY') {
                        obj.origin_hasOfficialLottery = true;
                    }
                    obj.origin_description += node.orig_text;
                });
            } else {
                ditem?.orig.modules?.module_dynamic?.major?.opus?.summary?.rich_text_nodes.forEach(node => {
                    /* 是否有官方抽奖 */
                    if (node.type === 'RICH_TEXT_NODE_TYPE_LOTTERY') {
                        obj.origin_hasOfficialLottery = true;
                    }
                    obj.origin_description += node.orig_text;
                });
            }
        }
    } catch (e) {
        log.error('动态卡片解析', e);
    }

    return obj;
}

/**
 * @param {object} dynamic_detail_card 
 * @return {UsefulDynamicInfo}
 */
function oldParseDynamicCard(dynamic_detail_card) {
    const { strToJson } = utils;
    /**临时储存单个动态中的信息 */
    let obj = {};
    try {
        const { desc, card, extension, extend_json = '{}', display = {} } = dynamic_detail_card
            , { is_liked = 1, user_profile = {} } = desc
            , { info = {} } = user_profile || {}
            , cardToJson = strToJson(card)
            , extendjsonToJson = strToJson(extend_json)
            , { add_on_card_info = [] } = display || {}
            , { item } = cardToJson;
        const dy_type2chat_type = new Map([[1, 17], [2, 11], [4, 17], [8, 1], [64, 12]]);
        /* 转发者的UID */
        obj.uid = desc.uid;
        /* 转发者的name */
        obj.uname = info.uname || '';
        /* 动态是否点过赞 */
        obj.is_liked = is_liked > 0;
        /* 动态的ts10 */
        obj.create_time = desc.timestamp;
        /* 动态类型 */
        obj.type = desc.type;
        /* 用于发送评论 */
        obj.rid_str = desc.rid_str.length > 12 ? desc.dynamic_id_str : desc.rid_str;
        /* 用于发送评论 */
        obj.chat_type = dy_type2chat_type.get(obj.type) || 0;
        /* 转发者的动态ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
        obj.dynamic_id = desc.dynamic_id_str;
        /* 定位@信息 */
        obj.ctrl = (extendjsonToJson.ctrl) || [];
        /* 预约抽奖信息 */
        if (add_on_card_info.length > 0) {
            const [status, oid_str, text] = add_on_card_info
                .filter(it => typeof it.reserve_attach_card !== 'undefined'
                    && typeof it.reserve_attach_card.reserve_lottery !== 'undefined'
                    && typeof it.reserve_attach_card.reserve_button !== 'undefined')
                .map(({ reserve_attach_card }) => [
                    reserve_attach_card.reserve_button.status,
                    reserve_attach_card.oid_str,
                    reserve_attach_card.reserve_lottery.text])[0] || [];
            if (status === 1) {
                obj.reserve_id = oid_str;
                obj.reserve_lottery_text = text;
            }
        }
        if (extendjsonToJson['']) {
            let r = extendjsonToJson[''].reserve || {};
            let { reserve_id, reserve_lottery } = r;
            if (reserve_lottery === 1) {
                obj.reserve_id = reserve_id + '';
                obj.reserve_lottery_text = '信息丢失';
            }
        }
        if (extend_json.match(/"":\{"lottery/)) {
            obj.is_charge_lottery = true;
        }
        /* 是否有官方抽奖 */
        obj.hasOfficialLottery = extension && extension.lott && true;
        /* 转发者的描述 纯文字内容 图片动态描述 后两个分别是视频动态的描述和视频本身的描述*/
        obj.description =
            (item && ((item.content || '') + (item.description || '')))
            || (
                (cardToJson.dynamic || '')
                + (cardToJson.desc || '')
                + (cardToJson.vest && cardToJson.vest.content || '')
            )
            || '';
        /* 转发 */
        if (obj.type === 1) {
            const { origin_extension, origin, origin_extend_json = '{}' } = cardToJson
                , originToJson = strToJson(origin)
                , { add_on_card_info = [] } = display.origin || {}
                , originExtendjsonToJson = strToJson(origin_extend_json)
                , { user, item } = originToJson;
            /* 源动态的ts10 */
            obj.origin_create_time = desc.origin.timestamp;
            /* 被转发者的UID */
            obj.origin_uid = desc.origin.uid;
            /* 源动态类型 */
            obj.origin_type = desc.orig_type;
            /* 被转发者的rid(用于发评论) */
            obj.origin_rid_str = desc.origin.rid_str.length > 12 ? desc.origin.dynamic_id_str : desc.origin.rid_str;
            /* 用于发送评论 */
            obj.origin_chat_type = dy_type2chat_type.get(obj.origin_type) || 0;
            /* 被转发者的动态的ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
            obj.origin_dynamic_id = desc.orig_dy_id_str;
            /* 预约抽奖信息 */
            if (add_on_card_info.length > 0) {
                const [status, oid_str, text] = add_on_card_info
                    .filter(it => typeof it.reserve_attach_card !== 'undefined'
                        && typeof it.reserve_attach_card.reserve_lottery !== 'undefined'
                        && typeof it.reserve_attach_card.reserve_button !== 'undefined')
                    .map(({ reserve_attach_card }) => [
                        reserve_attach_card.reserve_button.status,
                        reserve_attach_card.oid_str,
                        reserve_attach_card.reserve_lottery.text])[0] || [];
                if (status === 1) {
                    obj.origin_reserve_id = oid_str;
                    obj.origin_reserve_lottery_text = text;
                }
            }
            if (originExtendjsonToJson['']) {
                let r = originExtendjsonToJson[''].reserve || {};
                let { reserve_id, reserve_lottery } = r;
                if (reserve_lottery === 1) {
                    obj.origin_reserve_id = reserve_id + '';
                    obj.origin_reserve_lottery_text = '信息丢失';
                }
            }
            if (origin_extend_json.match(/"":\{"lottery/)) {
                obj.origin_is_charge_lottery = true;
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
    } catch (e) {
        log.error('动态卡片解析', e);
    }

    return obj;
}

/**
 * 处理来自个人动态或话题页面的一组动态数据
 * @param {String} res
 * @returns {{modifyDynamicResArray: UsefulDynamicInfo[], nextinfo: {has_more: number, next_offset: string}} | UsefulDynamicInfo |null}
 */
function modifyDynamicRes(res) {
    let
        { data, code } = utils.strToJson(res),
        { items, has_more, offset } = data || {};

    if (code !== 0) {
        log.error('处理动态数据', '获取动态数据出错,可能是访问太频繁 \n' + res);
        return null;
    }
 /**
 * !cards已经能涵盖cards == null，你在想什么？
 */
    if (!items || !items.length) {
        log.warn('处理动态数据', '未找到任何动态信息');
        items = [];
    }

    if (typeof has_more === 'undefined'
        && typeof offset === 'undefined') {
        log.error('处理动态数据', '该功能已失效');
        return null;
    }

    const
        /**
         * 字符串offset防止损失精度
         */
        next = {
            has_more,
            next_offset: offset
        },
        /**
         * 储存获取到的一组动态中的信息
         */
        array = next.has_more === 0
            ? []
            : items.map(item => parseDynamicCard({ item }));

    log.info('处理动态数据', `动态数据读取完毕(${items.length})(${next.has_more})`);

    return {
        modifyDynamicResArray: array,
        nextinfo: next
    };
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
    static async checkAllDynamic(host_mid, pages, time = 0, offset = '0') {
        log.info('检查所有动态', `准备读取${pages}页动态`);

        const { getOneDynamicInfoByUID } = bili,
            /**
             * 柯里化请求函数
             */
            curriedGetOneDynamicInfoByUID = utils.curryify(getOneDynamicInfoByUID),
            /**
             * 储存了特定UID的请求函数
             */
            hadUidGetOneDynamicInfoByUID = curriedGetOneDynamicInfoByUID(host_mid);

        /**
         * 储存所有经过整理后信息
         * @type { UsefulDynamicInfo[] }
         */
        let allModifyDynamicResArray = [];

        for (let i = 0; i < pages; i++) {
            log.info('检查所有动态', `正在读取其中第${i + 1}页动态`);

            // 当 offset 为 '0'（初始页）时，传入 offset 会报错
            const OneDynamicInfo = offset === '0'
                   ? await hadUidGetOneDynamicInfoByUID()
                   : await hadUidGetOneDynamicInfoByUID(offset);

            const mDRdata = modifyDynamicRes(OneDynamicInfo);

            if (mDRdata === null) {
                return null;
            }

            const
                /**
                 * 一片动态
                 */
                mDRArry = mDRdata.modifyDynamicResArray,
                nextinfo = mDRdata.nextinfo;

            if (nextinfo.has_more === 0) {
                offset = nextinfo.next_offset;
                log.info('检查所有动态', '已经是最后一页了故无法读取更多');
                break;
            } else {
                /**合并 */
                allModifyDynamicResArray.push.apply(allModifyDynamicResArray, mDRArry);
                offset = nextinfo.next_offset;
            }

            await utils.delay(time);
        }

        log.info('检查所有动态', `${pages}页信息读取完成`);

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
        const AllDynamic = await Searcher.checkAllDynamic(UID, uid_scan_page, search_wait);

        if (AllDynamic === null) return null;

        let { allModifyDynamicResArray } = AllDynamic,
            { length } = allModifyDynamicResArray;

        if (!length) return null;

        const fomatdata = await allModifyDynamicResArray
            .filter(d => {
                if (d.type === 1) {
                    return true;
                } else {
                    length--;
                    return false;
                }
            })
            .reduce(async (pre, cur) => {
                let
                    results = await pre,
                    { origin_dynamic_id } = cur,
                    is_liked = false;

                if (!check_if_duplicated || check_if_duplicated >= 2) {
                    const card = await bili.getOneDynamicByDyid(origin_dynamic_id);
                    log.info('获取动态', `查看源动态(${origin_dynamic_id})是否点赞 (${length--})`);
                    if (card) {
                        ({ is_liked } = parseDynamicCard(card));
                    }
                    await utils.delay(get_dynamic_detail_wait);
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
                    reserve_lottery_text: cur.origin_reserve_lottery_text,
                    is_charge_lottery: cur.origin_is_charge_lottery,
                    rid: cur.origin_rid_str,
                    chat_type: cur.origin_chat_type,
                    des: cur.origin_description,
                    type: cur.origin_type,
                    hasOfficialLottery: cur.origin_hasOfficialLottery
                });

                return results;
            }, Promise.resolve([]));

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
        log.info('获取动态', `开始获取带话题#${tag_name}#的动态信息`);

        const
            tag_id = await bili.getTagIDByTagName(tag_name),
            hotdy = await bili.getHotDynamicInfoByTagID(tag_id),
            modDR = modifyDynamicRes(hotdy);

        if (modDR === null) return null;

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
                reserve_lottery_text: o.reserve_lottery_text,
                is_charge_lottery: o.is_charge_lottery,
                rid: o.rid_str,
                chat_type: o.chat_type,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            };
        });
        log.info('获取动态', `成功获取带话题#${tag_name}#的动态信息`);

        return fomatdata;
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
                log.warn('获取动态', `该专栏(${id})创建时间大于设定天数(${article_create_time}天)`);
                continue;
            }
            const
                content = (await bili.getOneArticleByCv(id) || '').split('推荐文章')[0],
                dyids = content.match(/[0-9]{18,}/g) || [],
                short_ids = content.match(/(?<=b23.tv\/)[a-zA-Z0-9]{7}/g) || [],
                short_id_set = [...new Set(short_ids)],
                short_ids_to_dyids = await Promise.all(short_id_set.map(bili.shortDynamicIdToDyid)),
                dyid_set = [...new Set([...dyids, ...short_ids_to_dyids])],
                /**判断此专栏是否查看过的权重 */
                weight = dyid_set.length / 2;

            let { length } = dyid_set,
                /**初始权重 */
                _weight = 0,
                /**单个专栏中的dyid */
                _dyinfos = [];
            log.info('获取动态', `提取专栏(${id})中提及的dyid(${length})`);

            /**遍历某专栏中的dyids */
            for (const dyid of dyid_set) {
                log.info('获取动态', `查看专栏中所提及动态(${dyid}) (${length--})`);
                const card = await bili.getOneDynamicByDyid(dyid);

                if (card) {
                    await utils.delay(get_dynamic_detail_wait);

                    const parsed_card = parseDynamicCard(card)
                        , { is_liked } = parsed_card;

                    if (
                        ((!check_if_duplicated || check_if_duplicated >= 2)
                            && is_liked)
                        || ((check_if_duplicated >= 1)
                            && await d_storage.searchDyid(dyid))
                    ) {
                        log.info('获取动态', `动态(${dyid})已转发过`);
                        _weight += 1;
                    }

                    if (_weight >= weight && !not_check_article) {
                        log.warn('获取动态', '1/2动态曾经转过,该专栏或已查看,故中止');
                        _dyinfos = [];
                        break;
                    }

                    _dyinfos.push(parsed_card);
                } else {
                    log.warn('获取动态', `动态细节获取失败(${dyid})`);
                }
            }
            dyinfos.push(..._dyinfos);
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
                reserve_lottery_text: o.reserve_lottery_text,
                is_charge_lottery: o.is_charge_lottery,
                rid: o.rid_str,
                chat_type: o.chat_type,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            };
        });
        log.info('获取动态', `成功获取含关键词${key_words}的专栏信息`);

        return fomatdata;
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
                log.info('获取动态', `开始获取链接(${api})中的抽奖信息`);
                if (api.startsWith('file://')) {
                    utils.readLotteryInfoFile(api.substring(7)).then(resolve);
                } else {
                    send({
                        url: api,
                        config: {
                            redirect: true
                        },
                        method: 'GET',
                        success: ({ body }) => {
                            if (body.err_msg) {
                                log.error('从API响应数据中获取抽奖信息', body.err_msg);
                                resolve(null);
                            } else {
                                const raw_lottery_info = strToJson(body).lottery_info;

                                if (raw_lottery_info) {
                                    let { length } = raw_lottery_info;
                                    if (length) {
                                        const lottery_info = raw_lottery_info
                                            .reduce(async (pre, cur) => {
                                                let results = await pre
                                                    , { dyid } = cur;

                                                if (!check_if_duplicated || check_if_duplicated >= 2) {
                                                    log.info('获取动态', `查看动态(${dyid})是否点赞 (${length--})`);
                                                    const card = await bili.getOneDynamicByDyid(dyid);

                                                    if (card) {
                                                        await utils.delay(get_dynamic_detail_wait);

                                                        const { is_liked } = parseDynamicCard(card);

                                                        if (is_liked) {
                                                            log.info('获取动态', `动态(${dyid})已转发过`);
                                                        } else {
                                                            cur.is_liked = is_liked;
                                                            results.push(cur);
                                                        }
                                                    }
                                                } else {
                                                    results.push(cur);
                                                }

                                                return results;

                                            }, Promise.resolve([]));

                                        resolve(lottery_info);
                                        return;
                                    }
                                }
                                log.error('从API响应数据中获取抽奖信息', '非Json数据或没有lottery_info或lottery为空');
                                resolve(null);
                            }
                        },
                        failure: err => {
                            log.error('从API响应数据中获取抽奖信息', err);
                            resolve(null);
                        }
                    });
                }
            } else {
                log.warn('获取动态', '链接为空');
                resolve(null);
            }
        });
    }

    /**
     * 从本地文件中获取抽奖信息
     * @param {string} txt
     * @returns {Promise<LotteryInfo[] | null>}
     */
    async getLotteryInfoByTxT(txt) {
        log.info('获取动态', `开始获取${utils.lottery_dyids}`);
        const dyids = await utils.getLocalLotteryTxt(txt);
        let
            length = dyids.length,
            dyinfos = [];

        for (const dyid of dyids) {
            log.info('获取动态', `查看Txt中所提及动态(${dyid}) (${length--})`);
            const card = await bili.getOneDynamicByDyid(dyid);

            if (card) {
                await utils.delay(get_dynamic_detail_wait);

                const parsed_card = parseDynamicCard(card)
                    , { is_liked } = parsed_card;

                if (
                    ((!check_if_duplicated || check_if_duplicated >= 2)
                        && is_liked)
                    || ((check_if_duplicated >= 1)
                        && await d_storage.searchDyid(dyid))
                ) {
                    log.info('获取动态', `动态(${dyid})已转发过`);
                    continue;
                }

                dyinfos.push(parsed_card);
            } else {
                log.warn('获取动态', `动态细节获取失败(${dyid})`);
            }

        }
        const fomatdata = dyinfos.map(o => {
            return {
                lottery_info_type: 'txt',
                create_time: o.create_time,
                is_liked: o.is_liked,
                uids: [o.uid, o.origin_uid],
                uname: o.uname,
                ctrl: o.ctrl,
                dyid: o.dynamic_id,
                reserve_id: o.reserve_id,
                reserve_lottery_text: o.reserve_lottery_text,
                is_charge_lottery: o.is_charge_lottery,
                rid: o.rid_str,
                chat_type: o.chat_type,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            };
        });
        log.info('获取动态', '成功获取txt信息');

        return fomatdata;
    }
}

module.exports = { Searcher, parseDynamicCard };
