import {EventEmitter} from 'events';
import { HttpRequest } from './node/HttpRequest.js';
const Script = {
    version: '|version: 3.6.5|in nodejs',
    author: '@shanmite',
    UIDs: [
        213931643,
        15363359,
        31252386,
        80158015,
        678772444,
        35719643,
        223748830,
        420788931,
        689949971,
        38970985
    ],
    TAGs: [
        '抽奖',
        '互动抽奖',
        '转发抽奖',
        '动态抽奖',
    ]
}
/**
 * 默认设置
 */
let config = {
    model: '11',/* both */
    chatmodel: '01',/* both */
    maxday: '-1', /* 不限 */
    wait: '60000', /* 60s */
    minfollower: '500',/* 最少500人关注 */
    blacklist: '',
    whiteklist: '',
    relay: ['转发动态'],
    chat: [
        '[OK]', '[星星眼]', '[歪嘴]', '[喜欢]', '[偷笑]', '[笑]', '[喜极而泣]', '[辣眼睛]', '[吃瓜]', '[奋斗]',
        '永不缺席 永不中奖 永不放弃！', '万一呢', '在', '冲吖~', '来了', '万一', '[保佑][保佑]', '从未中，从未停', '[吃瓜]', '[抠鼻][抠鼻]',
        '来力', '秋梨膏', '[呲牙]', '从不缺席', '分子', '可以', '恰', '不会吧', '1', '好',
        'rush', '来来来', 'ok', '冲', '凑热闹', '我要我要[打call]', '我还能中！让我中！！！', '大家都散了吧，已经抽完了，是我的', '我是天选之子', '给我中一次吧！',
        '坚持不懈，迎难而上，开拓创新！', '[OK][OK]', '我来抽个奖', '中中中中中中', '[doge][doge][doge]', '我我我',
    ],
}
/**
 * 基础工具
 */
const Base = {
    /**
     * 安全的将JSON字符串转为对象
     * 超出精度的数转为字符串
     * @param {string} params
     * @return {object}
     * 返回对象
     */
    strToJson: params => {
        let isJSON = str => {
            if (typeof str === 'string') {
                try {
                    var obj = JSON.parse(str);
                    if (typeof obj === 'object' && obj) {
                        return true;
                    } else {
                        return false;
                    }
                } catch (e) {
                    console.error('error：' + str + '!!!' + e);
                    return false;
                }
            }
            console.error('It is not a string!')
        }
        if (isJSON(params)) {
            let obj = JSON.parse(params);
            return obj
        } else {
            return {}
        }
    },
    /**
     * 函数柯里化
     * @param {function} func
     * 要被柯里化的函数
     * @returns {function}
     * 一次接受一个参数并返回一个接受余下参数的函数
     */
    curryify: func => {
        function _c(restNum, argsList) {
            return restNum === 0 ?
                func.apply(null, argsList) :
                function (x) {
                    return _c(restNum - 1, argsList.concat(x));
                };
        }
        return _c(func.length, []);
    },
    /**
     * 延时函数
     * @param {number} time ms
     * @returns {Promise<void>}
     */
    delay: time => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, time)
        })
    },
    /**
     * 随机获取字符串数组中的字符串
     * @param {string[]} arr
     * @returns {string}
     */
    getRandomStr: arr => {
        return arr[parseInt(Math.random() * arr.length)]
    },
}
/**
 * 事件总线
 */
const eventBus = (() => {
    const eTarget = new EventEmitter()
        , module = {
            on: (type, fn) => {
                eTarget.addListener(type, fn);
            },
            emit: (type) => {
                eTarget.emit(type);
            },
            off: ()=>{
                eTarget.off()
            }
        }
    return module;
})()
/**
 * 贮存全局变量
 */
const GlobalVar = {
    cookie:'',
    /**自己的UID*/
    myUID: '',
    /**防跨站请求伪造*/
    csrf: '',
    /**
     * 抽奖信息
     * @type {(string|number)[]}
     */
    Lottery: (() => {
        return Script.UIDs.concat(Script.TAGs);
    })(),
};
/**
 * Ajax请求对象
 */
const Ajax = (() => {
    const get = ({
        url,
        queryStringsObj,
        success
    }) => {
        HttpRequest({
            type: 'GET',
            _url: url,
            _query_string: queryStringsObj,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                Accept: 'application/json, text/plain, */*',
                Cookie: GlobalVar.cookie,
            },
            success: success,
            error: (res)=>{
                console.log(res);
            }
        })
    };
    const post = ({
        url,
        data,
        success
    }) => {
        HttpRequest({
            type: 'POST',
            _url: url,
            contents: data,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                Cookie: GlobalVar.cookie,
            },
            success: success,
            error: (res)=>{
                console.log(res);
            }
        })
    };
    return { get, post };
})()
/**
 * 网络请求
 */
const BiliAPI = {
    /**
     * 获取被at的信息
     * @returns {
        Promise<{
            time: string;
            nickname: string;
            business: string;
            source_content: string;
            url: string
        }[] | []>
    }
     */
    getMyAtInfo: async ()=>{
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
                                const {at_time, item, user} = i
                                    , time = (new Date(at_time * 1000)).toLocaleString()
                                    , { nickname } = user
                                    , {business, uri:url ,source_content} = item;
                                atInfo.push({
                                    time,
                                    nickname,
                                    business,
                                    source_content,
                                    url
                                })
                            })
                        } 
                        resolve(atInfo);
                    } else {
                        resolve(atInfo)
                    }
                }
            })
        });
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
                    let res = Base.strToJson(responseText)
                    if (res.code === 0) {
                        console.log('[获取关注列表]成功');
                        resolve(res.data.list.toString())
                    } else {
                        console.log(`[获取关注列表]失败\n${responseText}`);
                        resolve(null)
                    }
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
                    resolve(responseText)
                }
            })
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
                        resolve(-1)
                    }
                    resolve(res.data.tag_id)
                }
            })
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
                    resolve(responseText)
                }
            })
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
                    resolve(responseText)
                }
            })
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
                        resolve(res.data.follower)
                    } else {
                        console.log('获取关注数出错,可能是访问过频繁');
                        resolve(0)
                    }
                }
            })
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
                    /(?<=_prize_cmt":").*(?=")/.exec()
                    if (res.code === 0) {
                        const timestamp10 = res.data.lottery_time,
                            timestamp13 = timestamp10 * 1000,
                            time = new Date(timestamp13);
                        const remain = (() => {
                            const timestr = ((timestamp13 - Date.now()) / 86400000).toString()
                                , timearr = timestr.replace(/(\d+)\.(\d+)/, "$1,0.$2").split(',');
                            const text = timearr[0][0] === '-' ? `开奖时间已过${timearr[0].substring(1)}天余${parseInt(timearr[1] * 24)}小时` : `还有${timearr[0]}天余${parseInt(timearr[1] * 24)}小时`;
                            return text
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
                        })
                    }
                }
            })
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
                        resolve(1)
                    } else {
                        console.log(`[自动关注]失败\n${responseText}`);
                        resolve(0)
                    }
                }
            })
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
                        resolve(1)
                    } else {
                        console.log(`[移动分区]up主分区移动失败\n${responseText}`);
                        resolve(0)
                    }
                }
            })
        });

    },
    /**
     * 取消关注
     * @param {number} uid 
     * @returns {void}
     */
    cancelAttention: uid => {
        Ajax.post({
            url: 'https://api.bilibili.com/x/relation/modify',
            hasCookies: true,
            dataType: 'application/x-www-form-urlencoded',
            data: {
                fid: `${uid}`,
                act: 2,
                re_src: 11,
                jsonp: 'jsonp',
                csrf: GlobalVar.csrf
            },
            success: responseText => {
                const res = Base.strToJson(responseText)
                if (res.code === 0) {
                    console.log('[自动取关]取关成功')
                } else {
                    console.log(`[自动取关]取关失败\n${responseText}`)
                }
            }
        })
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
            })
        });
    },
    /**
     * 转发前因查看是否重复转发
     * 自动转发
     * @param {Number} uid
     * 自己的UID
     * @param {string} dyid
     * 动态的ID
     * @returns {Promise<1|0>}
     */
    autoRelay: (uid, dyid) => {
        return new Promise((resolve) => {
            Ajax.post({
                url: 'https://api.vc.bilibili.com/dynamic_repost/v1/dynamic_repost/repost',
                hasCookies: true,
                dataType: 'application/x-www-form-urlencoded',
                data: {
                    uid: `${uid}`,
                    dynamic_id: dyid,
                    content: Base.getRandomStr(config.relay),
                    extension: '{"emoji_type":1}',
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        console.log('[转发动态]成功转发一条动态');
                        resolve(1)
                    } else {
                        console.log(`[转发动态]转发动态失败\n${responseText}`);
                        resolve(0)
                    }
                }
            })
        });
    },
    /**
     * 移除动态
     * @param {string} dyid
     * @returns {void}
     */
    rmDynamic: dyid => {
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
                } else {
                    console.log(`[删除动态]删除动态失败\n${responseText}`);
                }
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
                    jsonp: 'jsonp',
                    csrf: GlobalVar.csrf
                },
                success: responseText => {
                    if (/^{"code":0/.test(responseText)) {
                        show ? console.log('[自动评论]评论成功') : void 0;
                        resolve(1)
                    } else {
                        show ? console.log('[自动评论]评论失败') : void 0;
                        resolve(0)
                    }
                }
            })
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
                queryStringsObj: {
                    // jsonp: 'jsonp',
                    // callback: '__jp14'
                },
                hasCookies: true,
                success: responseText => {
                    if (!/此处存放因抽奖临时关注的up/.test(responseText)) {
                        /* 如果不存在就新建一个 */
                        Ajax.post({
                            url: 'https://api.bilibili.com/x/relation/tag/create?cross_domain=true',
                            hasCookies: true,
                            dataType: 'application/x-www-form-urlencoded',
                            data: {
                                tag: '此处存放因抽奖临时关注的up',
                                csrf: GlobalVar.csrf
                            },
                            success: responseText => {
                                let obj = Base.strToJson(responseText);
                                if (obj.code === 0) {
                                    console.log('[新建分区]分区新建成功')
                                    let tagid = obj.data.tagid /* 获取tagid */
                                    resolve(tagid)
                                }
                            }
                        })
                    } else {
                        /* 此处可能会出现问题 */
                        let tagid = /[0-9]*(?=,"name":"此处存放因抽奖临时关注的up")/.exec(responseText)[0] /* 获取tagid */
                        resolve(Number(tagid))
                    }
                }
            })
        });
    },
}
/**
 * 基础功能
 */
class Public {
    constructor() { }
    /**
     * 检查所有的动态信息
     * @param {string} UID
     * 指定的用户UID
     * @param {number} pages
     * 读取页数
     * @returns {
        Promise<{
            uid: number;
            dynamic_id: string;
            description: string;
            type: string;
            origin_uid: string;
            origin_uname: string;
            origin_rid_str: string;
            origin_dynamic_id: string;
            origin_hasOfficialLottery: boolean;
            origin_description: string;
            origin_type: string;
        }[]>
    } 获取前 pages*12 个动态信息
     */
    async checkAllDynamic(hostuid, pages, time = 0) {
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
        let offset = '0';
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
                console.log(`成功读取${i + 1}页信息(已经是最后一页了故无法读取更多)`);
                break;
            } else {
                allModifyDynamicResArray.push.apply(allModifyDynamicResArray, mDRArry);
                i + 1 < pages ? console.log(`开始读取第${i + 2}页动态信息`) : console.log(`${pages}页信息全部成功读取完成`);
                offset = nextinfo.next_offset;
            }
            await Base.delay(time);
        }
        return (allModifyDynamicResArray);
    }
    /**
     * 互动抽奖
     * 处理来自动态页面的数据
     * @param {String} res
     * @returns {
        {
            modifyDynamicResArray: {
                uid: number;
                uname: string;
                rid_str: string;
                dynamic_id: string;
                type: number;
                description: string;
                hasOfficialLottery: boolean;
                origin_uid: number;
                origin_uname: string;
                origin_rid_str: string;
                origin_dynamic_id: string;
                orig_type: number;
                origin_description: string;
                origin_hasOfficialLottery: boolean;
            }[];
            nextinfo: {
                has_more: number;
                next_offset: string;
            };
        } | null
    } 返回对象,默认为null
     */
    modifyDynamicRes(res) {
        const strToJson = Base.strToJson,
            jsonRes = strToJson(res),
            { data } = jsonRes;
        if (jsonRes.code !== 0) {
            console.log('获取动态数据出错,可能是访问太频繁');
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
                    , { info } = desc.user_profile
                    , cardToJson = strToJson(card);
                obj.uid = info.uid; /* 转发者的UID */
                obj.uname = info.uname;/* 转发者的name */
                obj.rid_str = desc.rid_str;/* 用于发送评论 */
                obj.type = desc.type /* 动态类型 */
                obj.orig_type = desc.orig_type /* 源动态类型 */
                obj.dynamic_id = desc.dynamic_id_str; /* 转发者的动态ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
                const { extension } = onecard;
                obj.hasOfficialLottery = (typeof extension === 'undefined') ? false : typeof extension.lott === 'undefined' ? false : true; /* 是否有官方抽奖 */
                const item = cardToJson.item || {};
                obj.description = item.content || item.description || ''; /* 转发者的描述 */
                if (obj.type === 1) {
                    obj.origin_uid = desc.origin.uid; /* 被转发者的UID */
                    obj.origin_rid_str = desc.origin.rid_str /* 被转发者的rid(用于发评论) */
                    obj.origin_dynamic_id = desc.orig_dy_id_str; /* 被转发者的动态的ID !!!!此为大数需使用字符串值,不然JSON.parse()会有丢失精度 */
                    const { origin,origin_extension } = cardToJson || {};
                    obj.origin_hasOfficialLottery = typeof origin_extension === 'undefined' ? false : typeof origin_extension.lott === 'undefined' ? false : true; /* 是否有官方抽奖 */
                    const { user, item } = typeof origin === 'undefined' ? {} : strToJson(origin);
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
     * 获取tag下的抽奖信息(转发母动态)  
     * 并初步整理
     * @returns {
        Promise<{
            uid: number;
            dyid: string;
            befilter: boolean;
            rid: string;
            des: string;
            type: number;
            hasOfficialLottery: boolean
        }[] | null>
    }
     */
    async getLotteryInfoByTag() {
        const self = this,
            tag_name = self.tag_name,
            tag_id = await BiliAPI.getTagIDByTagName(tag_name),
            hotdy = await BiliAPI.getHotDynamicInfoByTagID(tag_id),
            modDR = self.modifyDynamicRes(hotdy);
        if (modDR === null) return null;
        console.log(`开始获取带话题#${tag_name}#的动态信息`);
        let mDRdata = modDR.modifyDynamicResArray;
        const newdy = await BiliAPI.getOneDynamicInfoByTag(tag_name, modDR.nextinfo.next_offset);
        mDRdata.push.apply(mDRdata, self.modifyDynamicRes(newdy).modifyDynamicResArray);
        const fomatdata = mDRdata.map(o => {
            const hasOrigin = o.type === 1
            return {
                uid: o.uid,
                dyid: o.dynamic_id,
                befilter: hasOrigin,
                rid: o.rid_str,
                des: o.description,
                type: o.type,
                hasOfficialLottery: o.hasOfficialLottery
            }
        })
        console.log(`成功获取带话题#${tag_name}#的动态信息`);
        return fomatdata
    }
    /**
     * 获取最新动态信息(转发子动态)  
     * 并初步整理
     * @returns {
        Promise<{
            uid: number;
            dyid: string;
            befilter: boolean;
            rid: string;
            des: string;
            type: number;
            hasOfficialLottery: boolean
        }[] | null>
    }
     */
    async getLotteryInfoByUID() {
        const self = this,
            dy = await BiliAPI.getOneDynamicInfoByUID(self.UID, 0),
            modDR = self.modifyDynamicRes(dy);
        if (modDR === null) return null;
        const mDRdata = modDR.modifyDynamicResArray,
            _fomatdata = mDRdata.map(o => {
                return {
                    uid: o.origin_uid,
                    dyid: o.origin_dynamic_id,
                    befilter: false,
                    rid: o.origin_rid_str,
                    des: o.origin_description,
                    type: o.orig_type,
                    hasOfficialLottery: o.origin_hasOfficialLottery
                }
            })
        const fomatdata = _fomatdata.filter(a => {
            if (a.type === 0) {
                return false
            }
            return true
        })
        return fomatdata
    }
}
/**
 * 监视器
 */
class Monitor extends Public {
    /**
     * @param {number | string} param
     */
    constructor(param) {
        super();
        typeof param === 'number' ? this.UID = param : this.tag_name = param;
        this.tagid = 0; /* tagid初始化为默认分组 */
        this.attentionList = ''; /* 转为字符串的所有关注的up主uid */
        this.AllMyLotteryInfo = '' /* 转发过的动态信息 */
    }
    /**
     * 初始化
     */
    async init() {
        if (config.model === '00') { console.log('已关闭所有转发行为'); return }
        if (GlobalVar.Lottery.length === 0) { console.log('抽奖信息为空'); return }
        this.tagid = await BiliAPI.checkMyPartition(); /* 检查关注分区 */
        this.attentionList = await BiliAPI.getAttentionList(GlobalVar.myUID);
        const AllDynamic = await this.checkAllDynamic(GlobalVar.myUID,10);
        let string = ''
        for (let index = 0; index < AllDynamic.length; index++) {
            const oneDynamicObj = AllDynamic[index];
            if (typeof oneDynamicObj.origin_dynamic_id === 'string') {
                string += oneDynamicObj.origin_dynamic_id;
            }
        }
        this.AllMyLotteryInfo = string;
        this.startLottery()
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
     * @returns {
        Promise<{
            uid: number;
            dyid: string;
            type: number;
            rid: string;
        }[] | []>
    }
     */
    async filterLotteryInfo() {
        const self = this,
            protoLotteryInfo = typeof self.UID === 'number' ? await self.getLotteryInfoByUID() : await self.getLotteryInfoByTag();
        if (protoLotteryInfo === null) return [];
        let alllotteryinfo = [];
        const { model, chatmodel, maxday: _maxday, minfollower, blacklist } = config;
        const maxday = _maxday === '-1' || _maxday === '' ? Infinity : (Number(_maxday) * 86400);
        for (const info of protoLotteryInfo) {
            const { uid, dyid, befilter, rid, des, type, hasOfficialLottery } = info;
            let onelotteryinfo = {};
            let isLottery = false;
            let isSendChat = false;
            let ts = 0;
            const description = typeof des === 'string' ? des : '';
            if (hasOfficialLottery && model[0] === '1') {
                const oneLNotice = await BiliAPI.getLotteryNotice(dyid);
                ts = oneLNotice.ts;
                isLottery = ts > (Date.now() / 1000) && ts < maxday;
                isSendChat = chatmodel[0] === '1';
            } else if (!hasOfficialLottery && model[1] === '1') {
                const followerNum = await BiliAPI.getUserInfo(uid);
                if (followerNum < Number(minfollower)) continue;
                isLottery = /[关转]/.test(description) && !befilter;
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
        return alllotteryinfo
    }
    /**
     * 关注转发评论
     * @param {
        {
            uid: number;
            dyid: string;
            type: number;
            rid: string;
        }
    } obj
     */
    async go(obj) {
        const { uid, dyid, type, rid } = obj;
        let ret = '';
        if (typeof dyid === 'string') {
            ret += await BiliAPI.autoRelay(GlobalVar.myUID, dyid);
            BiliAPI.autolike(dyid);
            if (typeof uid === 'number') {
                ret += await BiliAPI.autoAttention(uid);
                ret += await BiliAPI.movePartition(uid, this.tagid)
            }
            if (typeof rid === 'string' && type !== 0) {
                ret += await BiliAPI.sendChat(rid, Base.getRandomStr(config.chat), type);
            }
            await Base.delay(Number(config.wait));
        }
        if (ret === '' || ret.indexOf('0') === -1) return 1
        return 0;
    }
}
/**
 * 主函数
 * @param {string} cookie
 */
export async function main(cookie) {
    GlobalVar.cookie = cookie;
    const [myUID, csrf] = (() => {
        const a = /((?<=DedeUserID=)\d+).*((?<=bili_jct=)\w+)/g.exec(cookie);
        return [a[1], a[2]]
    })();
    GlobalVar.myUID = myUID;
    GlobalVar.csrf = csrf;
    /* 注册事件 */
    {
        let i = 0;
        eventBus.on('Turn_on_the_Monitor', () => {
            if (i === GlobalVar.Lottery.length) {
                console.log('所有动态转发完毕');
                console.log('[运行结束]目前无抽奖信息,过一会儿再来看看吧');
                i = 0;
                return;
            }
            (new Monitor(GlobalVar.Lottery[i++])).init();
        });
    }
    eventBus.emit('Turn_on_the_Monitor');
    BiliAPI.sendChat('456295362727813281', (new Date(Date.now())).toLocaleString() + Script.version, 17, false);
}
/**
 * 是否中奖
 * @param {string} SCKEY
 */
export async function isMe(SCKEY) {
    if (typeof SCKEY === 'undefined') return;
    const arr = await BiliAPI.getMyAtInfo();
    const text = '可能中奖了!';
    let desp = '';
    if (arr.length !== 0) {
        arr.forEach(e => {
            desp += `发生时间: ${e.time}  \n\n`
            desp += `用户: ${e.nickname}  \n\n`
            desp += `在${e.business}中@了你  \n\n`
            desp += `原内容为: ${e.source_content}  \n\n`
            desp += `[直达链接](${e.url})  \n\n`
            desp += `---\n\n`
        });
    }
    if (desp !== '') {
        Ajax.get({
            url: `https://sc.ftqq.com/${SCKEY}.send`,
            queryStringsObj: {
                text,
                desp
            },
            success: responseText => {
                console.log(responseText);
            }
        })
    }
    return;
}