const GlobalVar = require('../data/global_var');
const { strToJson, log } = require('../utils');
const { send } = require('./http');
const API = require('./api.bili');

/**
 * GET请求
 * @param {import('./http').RequestOptions} param0
 * @returns {Promise<string>}
 */
function get({ url, config, contents, query }) {
    return new Promise((resolve) => {
        send({
            url,
            method: 'GET',
            config,
            headers: {
                "accept": 'application/json, text/plain, */*',
                "cookie": GlobalVar.get("cookie")
            },
            query,
            contents,
            success: res => resolve(res.body),
            failure: err => resolve(err)
        })
    })
}

/**
 * POST请求
 * @param {import('./http').RequestOptions} param0
 * @returns {Promise<string>}
 */
function post({ url, config, contents, query }) {
    return new Promise((resolve) => {
        send({
            url,
            method: 'POST',
            config,
            headers: {
                "accept": 'application/json, text/plain, */*',
                "content-type": 'application/x-www-form-urlencoded; charset=utf-8',
                "cookie": GlobalVar.get("cookie")
            },
            query,
            contents,
            success: res => resolve(res.body),
            failure: err => resolve(err)
        })
    })
}

/**
 * 网络请求
 */
const bili_client = {
    /**
     * 判断是否成功登录
     * @returns {Promise<boolean>}
     */
    async getMyinfo() {
        return get({
            url: API.SPACE_MYINFO
        }).then(responseText => {
            let res = strToJson(responseText);
            if (res.code === 0) {
                return true;
            } else {
                return false;
            }
        })
    },
    /**
     * 获取被at的信息
     * @typedef AtInfo
     * @property {number} at_time
     * @property {string} up_uname
     * @property {string} business
     * @property {string} source_content
     * @property {string} url
     * @returns {Promise<AtInfo[]>}
     */
    async getMyAtInfo() {
        return get({
            url: API.MSGFEED_AT
        }).then(responseText => {
            const res = strToJson(responseText);
            const atInfo = [];
            if (res.code === 0) {
                const items = res.data.items;
                if (items.length !== 0) {
                    items.forEach(i => {
                        const { at_time, item, user } = i
                            , { nickname: up_uname } = user
                            , { business, uri: url, source_content } = item;
                        atInfo.push({
                            at_time,
                            up_uname,
                            business,
                            source_content,
                            url
                        });
                    });
                }
                return atInfo;
            } else {
                return atInfo;
            }
        })
    },
    /**
     * 获取未读@
     * @returns {Promise<number>}
     */
    async getUnreadAtNum() {
        return get({
            url: API.MSGFEED_UNREAD
        }).then(responseText => {
            let res = strToJson(responseText);
            if (res.code === 0) {
                const { at } = res.data;
                log.info('获取未读@', `成功 数量: ${at}`)
                return at
            } else {
                log.error('获取未读@', `失败\n${responseText}`)
                return -1
            }
        })
    },
    /**
     * 获取私信
     * @typedef SessionData
     * @property {string} session_ts
     * @property {string} content
     * @property {number} timestamp
     * @property {number} unread_count
     * @property {number} sender_uid
     * @property {number} talker_id
     * @property {number} msg_seqno
     * 
     * @typedef SessionInfo
     * @property {number} has_more
     * @property {SessionData[]} data
     * 
     * @param {number} session_type 1 已关注 2 未关注 3 应援团
     * @param {string} [ts_16]
     * @returns {Promise<SessionInfo>}
     */
    async getSessionInfo(session_type, ts_16 = '') {
        return get({
            url: API.SESSION_SVR_GET_SESSIONS,
            query: {
                session_type,
                end_ts: ts_16,
            }
        }).then(responseText => {
            let res = strToJson(responseText);
            if (res.code === 0) {
                log.info('获取一页私信(20)', '成功 ' + (ts_16 ? 'end_ts->' + ts_16 : '第一页'));
                /**@type {Array} */
                const sessions = res.data.session_list || [];
                const has_more = res.data.has_more;
                const data = sessions.map(session => {
                    const { session_ts, last_msg, unread_count, talker_id } = session;
                    const { content = '', timestamp = 0, sender_uid = 0, msg_seqno } = last_msg || {};
                    return { session_ts, content, timestamp, sender_uid, unread_count, talker_id, msg_seqno }
                })
                return { has_more, data }
            } else if (res.code === 2) {
                log.error('获取私信', `API抽风...请再次尝试`);
                return { has_more: 0, data: [] }
            } else {
                log.error('获取私信', `失败\n${responseText}`);
                return { has_more: 0, data: [] }
            }
        })
    },
    /**
     * 获取未读私信数量
     * @returns {Promise<{ unfollow_unread: number, follow_unread: number }>}
     */
    async getUnreadSessionNum() {
        return get({
            url: API.SESSION_SVR_SINGLE_UNREAD
        }).then(responseText => {
            let res = strToJson(responseText);
            if (res.code === 0) {
                const { unfollow_unread, follow_unread } = res.data;
                log.info('获取未读私信', `成功 已关注未读数: ${follow_unread}, 未关注未读数 ${unfollow_unread}`);
                return { unfollow_unread, follow_unread }
            } else {
                log.error('获取未读私信', `失败\n${responseText}`);
                return null
            }
        })
    },
    /**
     * 私信已读
     * @param {number} talker_id
     * @param {number} session_type
     * @param {number} msg_seqno
     */
    updateSessionStatus(talker_id, session_type, msg_seqno) {
        return post({
            url: API.SESSION_SVR_UPDATE_ACK,
            config: {
                retry: false
            },
            contents: {
                talker_id,
                session_type,
                ack_seqno: msg_seqno,
                csrf_token: GlobalVar.get("csrf"),
                csrf: GlobalVar.get("csrf")
            }
        }).then(responseText => {
            let res = strToJson(responseText);
            if (res.code === 0) {
                log.info('私信已读', `成功 -> talker_id: ${talker_id}`);
            } else {
                log.error('私信已读', `失败 -> talker_id: ${talker_id}\n${responseText}`);
            }
        })
    },
    /**
     * 获取关注列表
     * @param {number} uid
     * @returns {Promise<string | null>}
     */
    getAttentionList(uid) {
        return get({
            url: API.FEED_GET_ATTENTION_LIST,
            query: {
                uid
            }
        }).then(responseText => {
            let res = strToJson(responseText);
            if (res.code === 0) {
                log.info('获取关注列表', '成功');
                return res.data.list.toString()
            } else {
                log.error('获取关注列表', `失败\n${responseText}`);
                return null
            }
        })
    },
    /**
     * 获取一个动态的细节
     * @param {string} dynamic_id
     * @return {Promise<string>}
     */
    getOneDynamicByDyid(dynamic_id) {
        return get({
            url: API.DYNAMIC_SVR_GET_DYNAMIC_DETAIL,
            query: {
                dynamic_id
            }
        })
    },
    /**
     * 获取一组动态的信息
     * @param {number} host_uid 被查看者的uid
     * @param {string} offset_dynamic_id 此动态偏移量 初始为 0
     * @returns {Promise<string>}
     */
    getOneDynamicInfoByUID(host_uid, offset_dynamic_id) {
        /* 鉴别工作交由modifyDynamicRes完成 */
        return get({
            url: API.DYNAMIC_SVR_SPACE_HISTORY,
            query: {
                visitor_uid: GlobalVar.get("myUID"),
                host_uid,
                offset_dynamic_id,
            },
            config: {
                retry: false
            }
        })
    },
    /**
     * 通过tag名获取tag的id
     * @param {string} tag_name
     * tag名
     * @returns {Promise<number | -1>}
     * 正确:tag_ID
     * 错误:-1
     */
    getTagIDByTagName(tag_name) {
        return get({
            url: API.TAG_INFO,
            query: {
                tag_name
            }
        }).then(responseText => {
            const res = strToJson(responseText);
            if (res.code !== 0) {
                log.error('获取TagID', '失败');
                return -1
            } else {
                return res.data.tag_id
            }
        })
    },
    /**
     * 获取tag下的热门动态以及一条最新动态
     * @param {number} tagid
     * @returns {Promise<string>}
     */
    getHotDynamicInfoByTagID(tagid) {
        return get({
            url: API.TOPIC_SVR_TOPIC_NEW,
            query: {
                topic_id: tagid
            }
        })
    },
    /**
     * 获取tag下的最新动态
     * @param {string} tagname
     * @param {string} offset
     * @returns {Promise<string>}
     */
    getOneDynamicInfoByTag(tagname, offset) {
        return get({
            url: API.TOPIC_SVR_TOPIC_HISTORY,
            query: {
                topic_name: tagname,
                offset_dynamic_id: offset
            },
            config: {
                retry: false
            }
        })
    },
    /**
     * 搜索专栏
     * @param {string} keyword
     * @return {Promise<Array<number>>}
     */
    searchArticlesByKeyword(keyword) {
        return get({
            url: API.WEB_INTERFACE_SEARCH_TYPE,
            query: {
                keyword,
                page: 1,
                order: 'pubdate',
                search_type: 'article'
            }
        }).then(responseText => {
            const res = JSON.parse(responseText);
            if (res.code === 0) {
                log.info('搜索专栏', '成功 关键词: ' + keyword)
                return res.data.result.map(it => it.id)
            } else {
                log.error('搜索专栏', '失败 原因:\n' + responseText)
                return []
            }
        })
    },
    /**
     * 获取专栏内容
     * @param {number} cv
     * @returns {Promise<string>}
     */
    getOneArticleByCv(cv) {
        return get({
            url: API.READ_CV.replace('{{cv}}', cv)
        })
    },
    /**
     * 获取粉丝数
     * @param {number} uid
     * @returns {Promise<number | -1>}
     */
    getUserInfo(uid) {
        return get({
            url: API.WEB_INTERFACE_CARD,
            query: {
                mid: uid,
                photo: false
            },
            config: {
                retry: false
            }
        }).then(responseText => {
            const res = strToJson(responseText);
            if (res.code === 0) {
                return res.data.follower
            } else {
                log.warn('获取粉丝数', '尝试切换线路');
                return get({
                    url: API.RELATION_STAT,
                    query: {
                        vmid: uid
                    }
                }).then(responseText => {
                    const res = strToJson(responseText);
                    if (res.code === 0) {
                        log.info('获取粉丝数', 'ok');
                        return res.data.follower
                    } else {
                        log.error('获取粉丝数', `出错 可能是访问过频繁\n${responseText}`);
                        return -1
                    }
                })
            }
        })
    },
    /**
     * 获取开奖信息
     * @param {string} dyid
     * 动态id
     * @typedef LotteryNotice
     * @property {number | -1} ts
     * @property {string | "获取开奖信息失败"} text
     * @property {string | "null"} item
     * @property {string | "未知"} isMe
     * @returns {Promise<LotteryNotice>} 开奖时间
     */
    getLotteryNotice(dyid) {
        return get({
            url: API.LOTTERY_SVR_LOTTERY_NOTICE,
            query: {
                dynamic_id: dyid
            }
        }).then(responseText => {
            const res = strToJson(responseText);
            /(?<=_prize_cmt":").*(?=")/.exec();
            if (res.code === 0) {
                const timestamp10 = res.data.lottery_time,
                    timestamp13 = timestamp10 * 1000,
                    time = new Date(timestamp13);
                const remain = (() => {
                    const timestr = ((timestamp13 - Date.now()) / 86400000).toString(),
                        timearr = timestr.replace(/(\d+)\.(\d+)/, "$1,0.$2").split(',');
                    const text = timearr[0][0] === '-' ? `开奖时间已过${timearr[0].substring(1)}天余${parseInt(timearr[1] * 24)}小时` : `还有${timearr[0]}天余${parseInt(timearr[1] * 24)}小时`;
                    return text;
                })();
                let isMeB = (new RegExp(GlobalVar.get("myUID"))).test(responseText);
                const isMe = isMeB ? '中奖了！！！' : '未中奖';
                const iteminfo = res.data.first_prize_cmt || '' + '  ' + res.data.second_prize_cmt || '' + '  ' + res.data.third_prize_cmt || '';
                return {
                    ts: timestamp10,
                    text: `开奖时间: ${time.toLocaleString()} ${remain}`,
                    item: iteminfo,
                    isMe: isMe
                };
            } else {
                log.error('获取开奖信息', `失败\n${responseText}`);
                return {
                    ts: -1,
                    text: '获取开奖信息失败',
                    item: 'null',
                    isMe: '未知'
                };
            }
        })
    },
    /**
     * 之前不检查是否重复关注
     * 自动关注
     * 并转移分组
     * @param {Number} uid
     * 被关注者的UID
     * @returns {Promise<number>}
     * 0 - 成功  
     * 1 - 失败  
     * 2 - 异常  
     */
    autoAttention(uid) {
        return post({
            url: API.RELATION_MODIFY,
            config: {
                retry: false
            },
            contents: {
                fid: uid,
                act: 1,
                re_src: 0,
                csrf: GlobalVar.get("csrf")
            }
        }).then(responseText => {
            let _responseText = ''
            /* 重复关注code also equal 0  */
            const res = strToJson(responseText)
            _responseText += responseText
            if (res.code === 0) {
                log.info('自动关注', '关注+1');
                return 0
            } else if (res.code === 22002) {
                log.error('自动关注', '您已被对方拉入黑名单');
                return 1
            } else {
                log.warn('自动关注', `失败 尝试切换线路\n${responseText}`);
                _responseText += responseText
                return post({
                    url: API.FEED_SETUSERFOLLOW,
                    contents: {
                        type: 1,
                        follow: uid,
                        csrf: GlobalVar.get("csrf")
                    }
                }).then(responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        log.info('自动关注', '关注+1');
                        return 0
                    } else {
                        log.warn('自动关注', `失败 尝试切换另一条线路\n${responseText}`);
                        _responseText += responseText
                        return post({
                            url: API.RELATION_BATCH_MODIFY,
                            contents: {
                                fid: uid,
                                act: 1,
                                re_src: 0,
                                csrf: GlobalVar.get("csrf")
                            }
                        }).then(responseText => {
                            if (/^{"code":0/.test(responseText)) {
                                log.info('自动关注', '关注+1');
                                return 0
                            } else {
                                log.error('自动关注', `失败\n${responseText}`);
                                _responseText += responseText
                                if (_responseText.includes(22015)) {
                                    return 2
                                }
                                return 1
                            }
                        })
                    }
                })
            }
        })
    },
    /**
     * 移动分区
     * @param {number} uid
     * @param {number} tagid 关注分区的ID
     * @returns {Promise<number>}
     * 0 - 成功  
     * 1 - 失败  
     */
    movePartition(uid, tagid) {
        return post({
            url: API.RELATION_TAGS_ADDUSERS,
            contents: {
                fids: uid,
                tagids: tagid,
                csrf: GlobalVar.get("csrf")
            }
        }).then(responseText => {
            /* 重复移动code also equal 0 */
            if (/^{"code":0/.test(responseText)) {
                log.info('移动分区', 'up主分区移动成功');
                return 0
            } else {
                log.error('移动分区', `up主分区移动失败\n${responseText}`);
                return 1
            }
        })
    },
    /**
     * 取消关注
     * @param {number} uid
     * @returns {Promise<boolean>}
     */
    cancelAttention(uid) {
        return post({
            url: API.RELATION_MODIFY,
            config: {
                retry: false
            },
            contents: {
                fid: uid,
                act: 2,
                re_src: 0,
                csrf: GlobalVar.get("csrf")
            }
        }).then(responseText => {
            const res = strToJson(responseText);
            if (res.code === 0) {
                log.info('自动取关', `取关成功(${uid})`);
                return true
            } else {
                log.error('自动取关', `取关失败(${uid})\n${responseText}`);
                return false
            }
        })
    },
    /**
     * 动态自动点赞
     * @param {string} dyid
     * @returns {Promise<number>}
     * 0 - 成功  
     * 1 - 失败  
     */
    autolike(dyid) {
        return post({
            url: API.DYNAMIC_LIKE_THUMB,
            contents: {
                uid: GlobalVar.get("myUID"),
                dynamic_id: dyid,
                up: 1,
                csrf: GlobalVar.get("csrf")
            }
        }).then(responseText => {
            if (/^{"code":0/.test(responseText)) {
                log.info('自动点赞', '点赞成功');
                return 0
            } else {
                log.error('自动点赞', `点赞失败\n${responseText}`);
                return 1
            }
        })
    },
    /**
     * 转发前应查看是否重复转发
     * 自动转发
     * @param {Number} uid
     * 自己的UID
     * @param {string} dyid
     * @param {string} [msg]
     * 动态的ID
     * @returns {Promise<number>}
     * 0 - 成功  
     * 1 - 失败  
     */
    autoRelay(uid, dyid, msg = '转发动态', ctrl = '[]') {
        const len = msg.length;
        if (len > 233) {
            msg = msg.slice(0, 233 - len)
        }
        return post({
            url: API.DYNAMIC_REPOST_REPOST,
            config: {
                retry: false
            },
            contents: {
                uid: `${uid}`,
                dynamic_id: dyid,
                content: msg,
                ctrl,
                csrf: GlobalVar.get("csrf")
            }
        }).then(responseText => {
            if (/^{"code":0/.test(responseText)) {
                log.info('转发动态', '成功转发一条动态');
                return 0
            } else {
                log.error('转发动态', `转发动态失败\n${responseText}`);
                return 1
            }
        })
    },
    /**
     * @typedef Picture
     * @property {string} img_src
     * @property {number} img_width
     * @property {number} img_height
     * 发布一条动态
     * @param { string | Picture[] } content
     * @return {Promise<void>}
     */
    createDynamic(content) {
        let contents = {
            csrf: GlobalVar.get("csrf"),
            extension: '{"emoji_type":1,"from":{"emoji_type":1},"flag_cfg":{}}'
        }
        let url = '';
        if (content instanceof Array) {
            url = API.DYNAMIC_SVR_CREATE_DRAW
            contents = {
                ...contents,
                biz: 3,
                category: 3,
                pictures: JSON.stringify(content)
            }
        } else {
            url = API.DYNAMIC_SVR_CREATE
            contents = {
                ...contents,
                content,
            }
        }
        return post({
            url,
            contents,
        }).then(responseText => {
            if (/^{"code":0/.test(responseText)) {
                log.info('发布动态', '成功创建一条随机内容的动态');
            } else {
                log.error('发布动态', `发布动态失败\n${responseText}`);
            }
        })
    },
    /**
     * 移除动态
     * @param {string} dyid
     * @returns {Promise<boolean>}
     */
    rmDynamic(dyid) {
        return post({
            url: API.DYNAMIC_SVR_RM_DYNAMIC,
            contents: {
                dynamic_id: dyid,
                csrf: GlobalVar.get("csrf")
            },
            config: {
                retry: false
            }
        }).then(responseText => {
            if (/^{"code":0/.test(responseText)) {
                log.info('删除动态', `成功删除一条动态(${dyid})`);
                return true
            } else {
                log.error('删除动态', `删除动态失败(${dyid})\n${responseText}`);
                return false
            }
        })
    },
    /**
     * 发送评论
     * @param {string} rid
     * cid_str
     * @param {string} msg
     * @param {number} type
     * 1(视频)
     * 11(有图)
     * 17(无图)
     * @returns {Promise<number>}
     * - 成功 0
     * - 失败 1
     * - 黑名单 -1
     */
    sendChat(rid, msg, type, show = true) {
        return post({
            url: API.REPLY_ADD,
            contents: {
                oid: rid,
                type: type,
                message: msg,
                csrf: GlobalVar.get("csrf")
            }
        }).then(responseText => {
            const res = strToJson(responseText);
            if (res.code === 0) {
                show && log.info('自动评论', '评论成功');
                return 0
            } else if (res.code === -404) {
                show && log.error('自动评论', '原动态已删除');
                return 0
            } else if (res.code === 12002) {
                show && log.error('自动评论', '评论区已关闭');
                return 0
            } else if (res.code === 12015) {
                show && log.error('自动评论', '需要输入验证码');
                return 1
            } else if (res.code === 12053) {
                show && log.error('自动评论', '黑名单用户无法互动');
                return -1
            } else {
                show && log.error('自动评论', `评论失败\n${responseText}`);
                return 1
            }
        })
    },
    /**
     * 检查分区  
     * 不存在指定分区时创建  
     * 获取到tagid添加为对象的属性  
     * @param {string} [name]
     * @returns {Promise<number>}
     */
    checkMyPartition(name) {
        if (!name) name = '此处存放因抽奖临时关注的up';
        return get({
            url: API.RELATION_TAGS
        }).then(responseText => {
            const res = strToJson(responseText);
            let tagid = undefined;
            if (res.code === 0) {
                const data = res.data.filter((it) => it.name === name);
                if (data.length) {
                    log.info('获取分区id', '成功');
                    tagid = data[0].tagid
                } else {
                    log.warn('获取分区id', '失败 无指定分区');
                }
                if (name === '此处存放因抽奖临时关注的up') {
                    if (typeof tagid === 'undefined') {
                        return bili_client.createPartition(name)
                    } else {
                        return tagid
                    }
                } else {
                    return tagid
                }
            } else {
                log.error('获取分区id', `访问出错 可在my_config里手动填入\n${responseText}`)
                return tagid
            }
        })
    },
    /**
     * 创造分区
     * @param {string} partition_name
     * @returns {Promise<number>}
     */
    createPartition(partition_name) {
        return post({
            url: API.RELATION_TAG_CREATE,
            contents: {
                tag: partition_name,
                csrf: GlobalVar.get("csrf")
            }
        }).then(responseText => {
            let obj = strToJson(responseText);
            if (obj.code === 0) {
                log.info('新建分区', '分区新建成功')
                /* 获取tagid */
                let { tagid } = obj.data
                return tagid
            } else {
                log.error('新建分区', `分区新建失败\n${responseText}`);
                return undefined
            }
        })
    },
    /**
     * 获取一个分区中50个的id
     * @param {number} tagid
     * @param {number} n 1->
     * @returns {Promise<number[]>}
     */
    getPartitionUID(tagid, n) {
        return get({
            url: API.RELATION_TAG,
            query: {
                mid: GlobalVar.get("myUID"),
                tagid: tagid,
                pn: n,
                ps: 50
            }
        }).then(responseText => {
            const res = strToJson(responseText);
            let uids = [];
            if (res.code === 0) {
                res.data.forEach(d => {
                    uids.push(d.mid);
                })
                log.info(`获取分组${tagid}`, `成功获取取关分区列表${n}`);
                return uids
            } else {
                log.error(`获取分组${tagid}`, `获取取关分区列表失败\n${responseText}`);
                return uids
            }
        })
    }
};


module.exports = bili_client