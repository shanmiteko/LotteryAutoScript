const Ajax = require('./Ajax');
const Base = require('./Base');
const GlobalVar = require('./GlobalVar.json');

/**
 * 网络请求
 */
const BiliAPI = {
    /**
     * 判断是否成功登录
     * @returns {Promise<boolean>}
     */
    getMyinfo: async () => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/space/myinfo',
                hasCookies: true,
                success: responseText => {
                    let res = Base.strToJson(responseText);
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
    getMyAtInfo: async () => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/msgfeed/at',
                hasCookies: true,
                success: responseText => {
                    const res = Base.strToJson(responseText);
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
     * @param {string} ts_16
     * @returns {Promise<SessionInfo>}
     */
    getSessionInfo: async (ts_16 = '') => {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    session_type: 1,
                    group_fold: 1,
                    unfollow_fold: 1,
                    sort_rule: 2,
                    build: 0,
                    mobi_app: 'web',
                    end_ts: ts_16,
                },
                success: responseText => {
                    let res = Base.strToJson(responseText);
                    if (res.code === 0) {
                        console.log('[获取一页私信](20)成功 end_ts->' + ts_16);
                        /**@type {Array} */
                        const sessions = res.data.session_list || [];
                        const has_more = res.data.has_more;
                        const data = sessions.map(session => {
                            const { session_ts, last_msg, unread_count, talker_id } = session;
                            const { content, timestamp, sender_uid } = last_msg;
                            return { session_ts, content, timestamp, sender_uid, talker_id: unread_count ? talker_id : undefined }
                        })
                        resolve({ has_more, data })
                    } else {
                        console.log(`[获取私信]失败\n${responseText}`);
                        resolve({ has_more: 0, data: [] });
                    }
                }
            })
        });
    },
    /**
     * 私信已读
     * @param {number} talker_id
     */
    updateSessionStatus: (talker_id) => {
        Ajax.post({
            url: 'https://api.vc.bilibili.com/session_svr/v1/session_svr/update_ack',
            hasCookies: true,
            dataType: 'application/x-www-form-urlencoded',
            data: {
                talker_id,
                session_type: 1,
                ack_seqno: 1,
                mobi_app: "web",
                csrf_token: GlobalVar.csrf
            },
            success: responseText => {
                let res = Base.strToJson(responseText);
                if (res.code === 0) {
                    console.log(`[私信已读]成功 -> talker_id: ${talker_id}`);
                } else {
                    console.log(`[私信已读]失败 -> talker_id: ${talker_id}`);
                }
            }
        })
    },
    /**
     * 获取关注列表
     * @param {number} uid
     * @returns {Promise<string | null>}
     */
    getAttentionList: uid => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/feed/v1/feed/get_attention_list',
                queryStringsObj: {
                    uid: uid
                },
                hasCookies: true,
                success: responseText => {
                    let res = Base.strToJson(responseText);
                    if (res.code === 0) {
                        console.log('[获取关注列表]成功');
                        resolve(res.data.list.toString());
                    } else {
                        console.log(`[获取关注列表]失败\n${responseText}`);
                        resolve(null);
                    }
                }
            });
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
    getOneDynamicInfoByUID: (UID, offset) => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history',
                queryStringsObj: {
                    visitor_uid: GlobalVar.myUID,
                    host_uid: UID,
                    offset_dynamic_id: offset,
                },
                hasCookies: true,
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
    getTagIDByTagName: tagename => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/tag/info',
                queryStringsObj: {
                    tag_name: tagename
                },
                hasCookies: false,
                success: responseText => {
                    const res = Base.strToJson(responseText);
                    if (res.code !== 0) {
                        console.log('获取TagID失败');
                        resolve(-1);
                    }
                    resolve(res.data.tag_id);
                }
            });
        });
    },
    /**
     * 获取tag下的热门动态以及一条最新动态
     * @param {number} tagid
     * @returns {Promise<string>}
     */
    getHotDynamicInfoByTagID: tagid => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/topic_svr/v1/topic_svr/topic_new',
                queryStringsObj: {
                    topic_id: tagid
                },
                hasCookies: true,
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
    getOneDynamicInfoByTag: (tagname, offset) => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/topic_svr/v1/topic_svr/topic_history',
                queryStringsObj: {
                    topic_name: tagname,
                    offset_dynamic_id: offset
                },
                hasCookies: true,
                success: responseText => {
                    resolve(responseText);
                }
            });
        });
    },
    /**
     * 获取关注数
     * @param {number} uid
     * @returns {Promise<number | 0>}
     */
    getUserInfo: uid => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/web-interface/card',
                queryStringsObj: {
                    mid: uid,
                    photo: false
                },
                hasCookies: true,
                success: responseText => {
                    const res = Base.strToJson(responseText);
                    if (res.code === 0) {
                        resolve(res.data.follower);
                    } else {
                        console.log('获取关注数出错,可能是访问过频繁');
                        resolve(0);
                    }
                }
            });
        });
    },
    /**
     * 获取开奖信息
     * @param {string} dyid
     * 动态id
     * @returns {
        Promise<{
            ts:number|0;
            text:string|'获取开奖信息失败';
            item:string|'null';
            isMe:string|'未知';
        }>
    } 开奖时间
     */
    getLotteryNotice: dyid => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.vc.bilibili.com/lottery_svr/v1/lottery_svr/lottery_notice',
                queryStringsObj: {
                    dynamic_id: dyid
                },
                hasCookies: false,
                success: responseText => {
                    const res = Base.strToJson(responseText);
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
                        let isMeB = (new RegExp(GlobalVar.myUID)).test(responseText);
                        const isMe = isMeB ? '中奖了！！！' : '未中奖';
                        const iteminfo = res.data.first_prize_cmt || '' + '  ' + res.data.second_prize_cmt || '' + '  ' + res.data.third_prize_cmt || '';
                        resolve({
                            ts: timestamp10,
                            text: `开奖时间: ${time.toLocaleString()} ${remain}`,
                            item: iteminfo,
                            isMe: isMe
                        });
                    } else {
                        console.log(`获取开奖信息失败\n${responseText}`);
                        resolve({
                            ts: 0,
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
     * @returns {Promise<1|0>}
     */
    autoAttention: uid => {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/relation/modify',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    fid: uid,
                    act: 1,
                    re_src: 11,
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    /* 重复关注code also equal 0  */
                    if (/^{"code":0/.test(responseText)) {
                        console.log('[自动关注]关注+1');
                        resolve(1);
                    } else {
                        console.log(`[自动关注]失败 尝试切换线路\n${responseText}`);
                        Ajax.post({
                            url: 'https://api.vc.bilibili.com/feed/v1/feed/SetUserFollow',
                            hasCookies: true,
                            dataType: 'application/x-www-form-urlencoded',
                            data: {
                                type: 1,
                                follow: uid,
                                csrf: GlobalVar.csrf
                            },
                            success: responseText => {
                                if (/^{"code":0/.test(responseText)) {
                                    console.log('[自动关注]关注+1');
                                    resolve(1);
                                } else {
                                    console.log(`[自动关注]失败 尝试切换另一条线路\n${responseText}`);
                                    Ajax.post({
                                        url: 'https://api.bilibili.com/x/relation/batch/modify',
                                        hasCookies: true,
                                        dataType: 'application/x-www-form-urlencoded',
                                        data: {
                                            fid: uid,
                                            act: 1,
                                            re_src: 11,
                                            csrf: GlobalVar.csrf
                                        },
                                        success: responseText => {
                                            if (/^{"code":0/.test(responseText)) {
                                                console.log('[自动关注]关注+1');
                                                resolve(1);
                                            } else {
                                                console.log(`[自动关注]失败\n${responseText}`);
                                                resolve(0);
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
     * @returns {Promise<1|0>}
     */
    movePartition: (uid, tagid) => {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/relation/tags/addUsers',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    fids: uid,
                    tagids: tagid,
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    /* 重复移动code also equal 0 */
                    if (/^{"code":0/.test(responseText)) {
                        console.log('[移动分区]up主分区移动成功');
                        resolve(1);
                    } else {
                        console.log(`[移动分区]up主分区移动失败\n${responseText}`);
                        resolve(0);
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
    cancelAttention: uid => {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/relation/modify',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    fid: uid,
                    act: 2,
                    re_src: 11,
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    const res = Base.strToJson(responseText);
                    if (res.code === 0) {
                        console.log('[自动取关]取关成功');
                        resolve(true)
                    } else {
                        console.log(`[自动取关]取关失败\n${responseText}`);
                        resolve(false)
                    }
                }
            });
        });
    },
    /**
     * 动态自动点赞
     * @param {string} dyid
     * @returns {Promise<1|0>}
     */
    autolike: dyid => {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/dynamic_like/v1/dynamic_like/thumb',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    uid: GlobalVar.myUID,
                    dynamic_id: dyid,
                    up: 1,
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        console.log('[自动点赞]点赞成功');
                        resolve(1);
                    } else {
                        console.log(`[转发动态]点赞失败\n${responseText}`);
                        resolve(0);
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
     * @returns {Promise<1|0>}
     */
    autoRelay: (uid, dyid, msg = '转发动态', ctrl = '[]') => {
        const len = msg.length;
        if (len > 233) {
            msg = msg.slice(0, 233 - len)
        }
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/dynamic_repost/v1/dynamic_repost/repost',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    uid: `${uid}`,
                    dynamic_id: dyid,
                    content: msg,
                    ctrl,
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        console.log('[转发动态]成功转发一条动态');
                        resolve(1);
                    } else {
                        console.log(`[转发动态]转发动态失败\n${responseText}`);
                        resolve(0);
                    }
                }
            });
        });
    },
    /**
     * @typedef Pictures
     * @property {string} img_src
     * 发布一条动态
     * @param {string} content
     * @param {Array<Pictures>} pictures
     */
    createDynamic: (content, pictures) => {
        let data = {
            csrf: GlobalVar.csrf,
            extension: '{"emoji_type":1,"from":{"emoji_type":1},"flag_cfg":{}}'
        }
        let url;
        if (content) {
            url = 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/create'
            data = {
                ...data,
                content,
            }
        }
        if (pictures) {
            url = 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/create_draw'
            data = {
                ...data,
                biz: 3,
                category: 3,
                pictures: JSON.stringify(pictures)
            }
        }
        Ajax.post({
            url,
            hasCookies: true,
            dataType: 'application/x-www-form-urlencoded',
            data,
            success: responseText => {
                if (/^{"code":0/.test(responseText)) {
                    console.log('[发布动态]成功创建一条随机内容的动态');
                } else {
                    console.warn(`[发布动态]发布动态失败\n${responseText}`);
                }
            }
        })
    },
    /**
     * 移除动态
     * @param {string} dyid
     * @returns {Promise<boolean>}
     */
    rmDynamic: dyid => {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/rm_dynamic',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    dynamic_id: dyid,
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        console.log('[删除动态]成功删除一条动态');
                        resolve(true);
                    } else {
                        console.log(`[删除动态]删除动态失败\n${responseText}`);
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
     * @returns {Promise<1|0>}
     */
    sendChat: (rid, msg, type, show = true) => {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.bilibili.com/x/v2/reply/add',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    oid: rid,
                    type: type,
                    message: msg,
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    const res = Base.strToJson(responseText);
                    if (res.code === 0) {
                        show ? console.log('[自动评论]评论成功') : void 0;
                        resolve(1);
                    } else if (res.code === -404) {
                        show ? console.log('[自动评论]原动态已删除') : void 0;
                        resolve(1);
                    } else {
                        show ? console.log('[自动评论]评论失败') : void 0;
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
     * @returns {Promise<number>}
     */
    checkMyPartition: () => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/relation/tags',
                hasCookies: true,
                success: responseText => {
                    if (!/此处存放因抽奖临时关注的up/.test(responseText)) {
                        /* 如果不存在就新建一个 */
                        Ajax.post({
                            url: 'https://api.bilibili.com/x/relation/tag/create',
                            hasCookies: true,
                            dataType: 'application/x-www-form-urlencoded',
                            data: {
                                tag: '此处存放因抽奖临时关注的up',
                                csrf: GlobalVar.csrf
                            },
                            success: responseText => {
                                let obj = Base.strToJson(responseText);
                                if (obj.code === 0) {
                                    console.log('[新建分区]分区新建成功');
                                    let tagid = obj.data.tagid; /* 获取tagid */
                                    resolve(tagid);
                                }
                            }
                        });
                    } else {
                        /* 此处可能会出现问题 */
                        let tagid = /[0-9]*(?=,"name":"此处存放因抽奖临时关注的up")/.exec(responseText)[0]; /* 获取tagid */
                        resolve(Number(tagid));
                    }
                }
            });
        });
    },
    /**
     * 获取一个分区中50个的id
     * @param {number} tagid
     * @param {number} n 1->
     * @returns {Promise<number[]>}
     */
    getPartitionUID: (tagid, n) => {
        return new Promise((resolve) => {
            Ajax.get({
                url: 'https://api.bilibili.com/x/relation/tag',
                queryStringsObj: {
                    mid: GlobalVar.myUID,
                    tagid: tagid,
                    pn: n,
                    ps: 50
                },
                hasCookies: true,
                success: responseText => {
                    const res = Base.strToJson(responseText);
                    let uids = [];
                    if (res.code === 0) {
                        res.data.forEach(d => {
                            uids.push(d.mid);
                        })
                        console.log(`[获取分组${tagid}]成功获取取关分区列表${n}`);
                        resolve(uids)
                    } else {
                        console.warn(`[获取分组]获取取关分区列表失败\n${responseText}`);
                        resolve(uids)
                    }
                }
            })
        });
    }
};

module.exports = BiliAPI;