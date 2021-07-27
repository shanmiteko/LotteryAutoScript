const Ajax = require('./Ajax');
const { strToJson, log } = require('./Util');
const GlobalVar = require('./GlobalVar');

/**
 * 网络请求
 */
const BiliAPI = {
    /**
     * 判断是否成功登录
     * @returns {Promise<boolean>}
     */
    async getMyinfo() {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/space/myinfo',
                success: responseText => {
                    let res = strToJson(responseText);
                    if (res.code === 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            })
        });
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
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/msgfeed/at',
                success: responseText => {
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
                        resolve(atInfo);
                    } else {
                        resolve(atInfo);
                    }
                }
            });
        });
    },
    /**
     * 获取未读@
     * @returns {Promise<number>}
     */
    async getUnreadAtNum() {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/msgfeed/unread',
                success: responseText => {
                    let res = strToJson(responseText);
                    if (res.code === 0) {
                        const { at } = res.data;
                        resolve(at)
                        log.info('获取未读@', `成功 数量: ${at}`)
                    } else {
                        resolve(-1)
                        log.error('获取未读@', `失败\n${responseText}`)
                    }
                }
            })
        });
    },
    /**
     * 获取私信
     * @typedef SessionData
     * @property {string} session_ts
     * @property {string} content
     * @property {number} timestamp
     * @property {number} sender_uid
     * @property {number} talker_id
     * 
     * @typedef SessionInfo
     * @property {number} has_more
     * @property {SessionData[]} data
     * 
     * @param {number} session_type 1 已关注 2 未关注
     * @param {string} [ts_16]
     * @returns {Promise<SessionInfo>}
     */
    async getSessionInfo(session_type, ts_16 = '') {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions',
                data: {
                    session_type,
                    group_fold: 1,
                    unfollow_fold: 1,
                    sort_rule: 2,
                    build: 0,
                    mobi_app: 'web',
                    end_ts: ts_16,
                },
                success: responseText => {
                    let res = strToJson(responseText);
                    if (res.code === 0) {
                        log.info('获取一页私信(20)', '成功 ' + (ts_16 ? 'end_ts->' + ts_16 : '第一页'));
                        /**@type {Array} */
                        const sessions = res.data.session_list || [];
                        const has_more = res.data.has_more;
                        const data = sessions.map(session => {
                            const { session_ts, last_msg = {}, unread_count, talker_id } = session;
                            const { content = '', timestamp = 0, sender_uid = 0 } = last_msg;
                            return { session_ts, content, timestamp, sender_uid, talker_id: unread_count ? talker_id : undefined }
                        })
                        resolve({ has_more, data })
                    } else {
                        log.error('获取私信', `失败\n${responseText}`);
                        resolve({ has_more: 0, data: [] });
                    }
                }
            })
        });
    },
    /**
     * 获取未读私信数量
     * @returns {Promise<{ unfollow_unread: number, follow_unread: number }>}
     */
    async getUnreadSessionNum() {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread',
                success: responseText => {
                    let res = strToJson(responseText);
                    if (res.code === 0) {
                        const { unfollow_unread, follow_unread } = res.data;
                        resolve({ unfollow_unread, follow_unread });
                        log.info('获取未读私信', `成功 已关注未读数: ${follow_unread}, 未关注未读数 ${unfollow_unread}`);
                    } else {
                        resolve(null);
                        log.error('获取未读私信', `失败\n${responseText}`);
                    }
                }
            })
        });
    },
    /**
     * 私信已读
     * @param {number} talker_id
     */
    updateSessionStatus(talker_id) {
        Ajax.post({
            url: 'https://api.vc.bilibili.com/session_svr/v1/session_svr/update_ack',
            retry: false,
            data: {
                talker_id,
                session_type: 1,
                ack_seqno: 1,
                mobi_app: "web",
                csrf_token: GlobalVar.get("csrf")
            },
            success: responseText => {
                let res = strToJson(responseText);
                if (res.code === 0) {
                    log.info('私信已读', `成功 -> talker_id: ${talker_id}`);
                } else {
                    log.error('私信已读', `失败 -> talker_id: ${talker_id}`);
                }
            }
        })
    },
    /**
     * 获取关注列表
     * @param {number} uid
     * @returns {Promise<string | null>}
     */
    getAttentionList(uid) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/feed/v1/feed/get_attention_list',
                queryStringsObj: {
                    uid: uid
                },
                success: responseText => {
                    let res = strToJson(responseText);
                    if (res.code === 0) {
                        log.info('获取关注列表', '成功');
                        resolve(res.data.list.toString());
                    } else {
                        log.error('获取关注列表', `失败\n${responseText}`);
                        resolve(null);
                    }
                }
            });
        });
    },
    /**
     * 获取一个动态的细节
     * @param {string} dyid
     * @return {Promise<string>}
     */
    getOneDynamicByDyid(dyid) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/get_dynamic_detail',
                queryStringsObj: {
                    dynamic_id: dyid
                },
                success: responseText => {
                    resolve(responseText)
                }
            })
        });
    },
    /**
     * 获取一组动态的信息
     * @param {number} UID
     * 被查看者的uid
     * @param {string} offset
     * 此动态偏移量
     * 初始为 0
     * @returns {Promise<string>}
     */
    getOneDynamicInfoByUID(UID, offset) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history',
                queryStringsObj: {
                    visitor_uid: GlobalVar.get("myUID"),
                    host_uid: UID,
                    offset_dynamic_id: offset,
                },
                retry: false,
                success: responseText => {
                    /* 鉴别工作交由modifyDynamicRes完成 */
                    resolve(responseText);
                }
            });
        });
    },
    /**
     * 通过tag名获取tag的id
     * @param {string} tagename
     * tag名
     * @returns {Promise<number | -1>}
     * 正确:tag_ID
     * 错误:-1
     */
    getTagIDByTagName(tagename) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/tag/info',
                queryStringsObj: {
                    tag_name: tagename
                },
                success: responseText => {
                    const res = strToJson(responseText);
                    if (res.code !== 0) {
                        log.error('获取TagID', '失败');
                        resolve(-1);
                    } else {
                        resolve(res.data.tag_id);
                    }
                }
            });
        });
    },
    /**
     * 获取tag下的热门动态以及一条最新动态
     * @param {number} tagid
     * @returns {Promise<string>}
     */
    getHotDynamicInfoByTagID(tagid) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/topic_svr/v1/topic_svr/topic_new',
                queryStringsObj: {
                    topic_id: tagid
                },
                success: responseText => {
                    resolve(responseText);
                }
            });
        });
    },
    /**
     * 获取tag下的最新动态
     * @param {string} tagname
     * @param {string} offset
     * @returns {Promise<string>}
     */
    getOneDynamicInfoByTag(tagname, offset) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/topic_svr/v1/topic_svr/topic_history',
                queryStringsObj: {
                    topic_name: tagname,
                    offset_dynamic_id: offset
                },
                retry: false,
                success: responseText => {
                    resolve(responseText);
                }
            });
        });
    },
    /**
     * 搜索专栏
     * @param {string} keyword
     * @return {Promise<Array<number>>}
     */
    searchArticlesByKeyword(keyword) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/web-interface/search/type',
                queryStringsObj: {
                    keyword,
                    page: 1,
                    order: 'pubdate',
                    search_type: 'article'
                },
                success: responseText => {
                    const res = JSON.parse(responseText);
                    if (res.code === 0) {
                        log.info('搜索专栏', '成功 关键词: ' + keyword)
                        resolve(res.data.result.map(it => it.id))
                    } else {
                        log.error('搜索专栏', '失败 原因:\n' + responseText)
                        resolve([])
                    }
                }
            })
        });
    },
    /**
     * 获取专栏内容
     * @param {number} cv
     * @returns {Promise<string>}
     */
    getOneArticleByCv(cv) {
        return new Promise((resolve) => {
            Ajax.get({
                url: `https://www.bilibili.com/read/cv${cv}`,
                success: responseText => {
                    resolve(responseText)
                }
            })
        });
    },
    /**
     * 获取粉丝数
     * @param {number} uid
     * @returns {Promise<number | -1>}
     */
    getUserInfo(uid) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/web-interface/card',
                queryStringsObj: {
                    mid: uid,
                    photo: false
                },
                retry: false,
                success: responseText => {
                    const res = strToJson(responseText);
                    if (res.code === 0) {
                        resolve(res.data.follower);
                    } else {
                        log.warn('获取粉丝数', '尝试切换线路');
                        Ajax.get({
                            url: 'https://api.bilibili.com/x/relation/stat',
                            queryStringsObj: {
                                vmid: uid
                            },
                            success: responseText => {
                                const res = strToJson(responseText);
                                if (res.code === 0) {
                                    log.info('获取粉丝数', 'ok');
                                    resolve(res.data.follower);
                                } else {
                                    log.error('获取粉丝数', `出错 可能是访问过频繁\n${responseText}`);
                                    resolve(-1);
                                }
                            }
                        })
                    }
                }
            });
        });
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
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/lottery_svr/v1/lottery_svr/lottery_notice',
                queryStringsObj: {
                    dynamic_id: dyid
                },
                success: responseText => {
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
                        resolve({
                            ts: timestamp10,
                            text: `开奖时间: ${time.toLocaleString()} ${remain}`,
                            item: iteminfo,
                            isMe: isMe
                        });
                    } else {
                        log.error('获取开奖信息', `失败\n${responseText}`);
                        resolve({
                            ts: -1,
                            text: '获取开奖信息失败',
                            item: 'null',
                            isMe: '未知'
                        });
                    }
                }
            });
        });
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
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/relation/modify',
                retry: false,
                data: {
                    fid: uid,
                    act: 1,
                    re_src: 11,
                    csrf: GlobalVar.get("csrf")
                },
                success: responseText => {
                    /* 重复关注code also equal 0  */
                    const res = strToJson(responseText)
                    if (res.code === 0) {
                        log.info('自动关注', '关注+1');
                        resolve(0);
                    } else if (res.code === 22002) {
                        log.error('自动关注', '您已被对方拉入黑名单');
                        resolve(1);
                    } else if (res.code === 22015) {
                        log.error('自动关注', '您的账号异常无法关注');
                        resolve(2);
                    } else {
                        log.warn('自动关注', `失败 尝试切换线路\n${responseText}`);
                        Ajax.post({
                            url: 'https://api.vc.bilibili.com/feed/v1/feed/SetUserFollow',
                            data: {
                                type: 1,
                                follow: uid,
                                csrf: GlobalVar.get("csrf")
                            },
                            success: responseText => {
                                if (/^{"code":0/.test(responseText)) {
                                    log.info('自动关注', '关注+1');
                                    resolve(0);
                                } else {
                                    log.warn('自动关注', `失败 尝试切换另一条线路\n${responseText}`);
                                    Ajax.post({
                                        url: 'https://api.bilibili.com/x/relation/batch/modify',
                                        data: {
                                            fid: uid,
                                            act: 1,
                                            re_src: 11,
                                            csrf: GlobalVar.get("csrf")
                                        },
                                        success: responseText => {
                                            if (/^{"code":0/.test(responseText)) {
                                                log.info('自动关注', '关注+1');
                                                resolve(0);
                                            } else {
                                                log.error('自动关注', `失败\n${responseText}`);
                                                resolve(1);
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            });
        });
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
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/relation/tags/addUsers',
                data: {
                    fids: uid,
                    tagids: tagid,
                    csrf: GlobalVar.get("csrf")
                },
                success: responseText => {
                    /* 重复移动code also equal 0 */
                    if (/^{"code":0/.test(responseText)) {
                        log.info('移动分区', 'up主分区移动成功');
                        resolve(0);
                    } else {
                        log.error('移动分区', `up主分区移动失败\n${responseText}`);
                        resolve(1);
                    }
                }
            });
        });
    },
    /**
     * 取消关注
     * @param {number} uid
     * @returns {Promise<boolean>}
     */
    cancelAttention(uid) {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/relation/modify',
                retry: false,
                data: {
                    fid: uid,
                    act: 2,
                    re_src: 11,
                    csrf: GlobalVar.get("csrf")
                },
                success: responseText => {
                    const res = strToJson(responseText);
                    if (res.code === 0) {
                        log.info('自动取关', '取关成功');
                        resolve(true)
                    } else {
                        log.error('自动取关', `取关失败\n${responseText}`);
                        resolve(false)
                    }
                }
            });
        });
    },
    /**
     * 动态自动点赞
     * @param {string} dyid
     * @returns {Promise<number>}
     * 0 - 成功  
     * 1 - 失败  
     */
    autolike(dyid) {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/dynamic_like/v1/dynamic_like/thumb',
                data: {
                    uid: GlobalVar.get("myUID"),
                    dynamic_id: dyid,
                    up: 1,
                    csrf: GlobalVar.get("csrf")
                },
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        log.info('自动点赞', '点赞成功');
                        resolve(0);
                    } else {
                        log.error('自动点赞', `点赞失败\n${responseText}`);
                        resolve(1);
                    }
                }
            });
        });
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
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/dynamic_repost/v1/dynamic_repost/repost',
                retry: false,
                data: {
                    uid: `${uid}`,
                    dynamic_id: dyid,
                    content: msg,
                    ctrl,
                    csrf: GlobalVar.get("csrf")
                },
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        log.info('转发动态', '成功转发一条动态');
                        resolve(0);
                    } else {
                        log.error('转发动态', `转发动态失败\n${responseText}`);
                        resolve(1);
                    }
                }
            });
        });
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
        let data = {
            csrf: GlobalVar.get("csrf"),
            extension: '{"emoji_type":1,"from":{"emoji_type":1},"flag_cfg":{}}'
        }
        let url = '';
        if (content instanceof Array) {
            url = 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/create_draw'
            data = {
                ...data,
                biz: 3,
                category: 3,
                pictures: JSON.stringify(content)
            }
        } else {
            url = 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/create'
            data = {
                ...data,
                content,
            }
        }
        return new Promise((resolve) => {
            Ajax.post({
                url,
                data,
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        log.info('发布动态', '成功创建一条随机内容的动态');
                    } else {
                        log.error('发布动态', `发布动态失败\n${responseText}`);
                    }
                    resolve()
                }
            })
        });
    },
    /**
     * 移除动态
     * @param {string} dyid
     * @returns {Promise<boolean>}
     */
    rmDynamic(dyid) {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/rm_dynamic',
                data: {
                    dynamic_id: dyid,
                    csrf: GlobalVar.get("csrf")
                },
                retry: false,
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        log.info('删除动态', '成功删除一条动态');
                        resolve(true);
                    } else {
                        log.error('删除动态', `删除动态失败\n${responseText}`);
                        resolve(false);
                    }
                }
            });
        });
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
     * 0 - 成功  
     * 1 - 失败  
     */
    sendChat(rid, msg, type, show = true) {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/v2/reply/add',
                data: {
                    oid: rid,
                    type: type,
                    message: msg,
                    csrf: GlobalVar.get("csrf")
                },
                success: responseText => {
                    const res = strToJson(responseText);
                    if (res.code === 0) {
                        show && log.info('自动评论', '评论成功');
                        resolve(0);
                    } else if (res.code === -404) {
                        show && log.error('自动评论', '原动态已删除');
                        resolve(0);
                    } else if (res.code === 12002) {
                        show && log.error('自动评论', '评论区已关闭');
                        resolve(0);
                    } else if (res.code === 12015) {
                        show && log.error('自动评论', '需要输入验证码');
                        resolve(1);
                    } else {
                        show && log.error('自动评论', `评论失败\n${responseText}`);
                        resolve(0);
                    }
                }
            });
        });
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
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/relation/tags',
                success: responseText => {
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
                                BiliAPI.createPartition(name).then(id => resolve(id))
                            } else {
                                resolve(tagid)
                            }
                        } else {
                            resolve(tagid)
                        }
                    } else {
                        log.error('获取分区id', `访问出错 可在my_config里手动填入\n${responseText}`)
                        resolve(tagid)
                    }
                }
            })
        });
    },
    /**
     * 创造分区
     * @param {string} partition_name
     * @returns {Promise<number>}
     */
    createPartition(partition_name) {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/relation/tag/create',
                data: {
                    tag: partition_name,
                    csrf: GlobalVar.get("csrf")
                },
                success: responseText => {
                    let obj = strToJson(responseText);
                    if (obj.code === 0) {
                        log.info('新建分区', '分区新建成功')
                        let { tagid } = obj.data /* 获取tagid */
                        resolve(tagid)
                    } else {
                        log.error('新建分区', `分区新建失败\n${responseText}`);
                        resolve(undefined);
                    }
                }
            })
        })
    },
    /**
     * 获取一个分区中50个的id
     * @param {number} tagid
     * @param {number} n 1->
     * @returns {Promise<number[]>}
     */
    getPartitionUID(tagid, n) {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/relation/tag',
                queryStringsObj: {
                    mid: GlobalVar.get("myUID"),
                    tagid: tagid,
                    pn: n,
                    ps: 50
                },
                success: responseText => {
                    const res = strToJson(responseText);
                    let uids = [];
                    if (res.code === 0) {
                        res.data.forEach(d => {
                            uids.push(d.mid);
                        })
                        log.info(`获取分组${tagid}`, `成功获取取关分区列表${n}`);
                        resolve(uids)
                    } else {
                        log.error(`获取分组${tagid}`, `获取取关分区列表失败\n${responseText}`);
                        resolve(uids)
                    }
                }
            })
        });
    }
};


module.exports = BiliAPI;