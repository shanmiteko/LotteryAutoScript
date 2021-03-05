const Ajax = require('./Ajax');
const Base = require('./Base');
const { transformTimeZone } = require('./Base');
const BiliAPI = require('./BiliAPI');
const eventBus = require('./eventBus');
const GlobalVar = require('./GlobalVar.json');
const Public = require('./Public');
const Monitor = require('./Monitor');

/**
 * server酱通知
 * @param {string} text
 * @param {string} desp
 */
const ServerChan = (text, desp) => {
    const { SCKEY } = GlobalVar;
    if (typeof SCKEY === 'string' && SCKEY.length > 5) {
        Ajax.get({
            url: `https://sc.ftqq.com/${SCKEY}.send`,
            queryStringsObj: {
                text,
                desp
            },
            success: responseText => {
                console.log(responseText);
                if (JSON.parse(responseText).errno !== 0) throw new Error("ServerChan通知失败")
            }
        })
    } else {
        console.log(`未填写SCKEY\n${desp}`)
    }
}

/**
 * pushplus通知
 * @param {string} text
 * @param {string} desp
 */
const pushplus = (text, desp) => {
    const { PUSH_PLUS_TOKEN } = GlobalVar;
    if (typeof PUSH_PLUS_TOKEN === 'string' && PUSH_PLUS_TOKEN.length > 5) {
        Ajax.get({
            url: `http://pushplus.hxtrip.com/send`,
            queryStringsObj: {
                token: PUSH_PLUS_TOKEN,
                title: text,
                content: desp
            },
            success: responseText => {
                console.log(responseText);
                if (JSON.parse(responseText).code !== 200) throw new Error("pushplus通知失败")
            }
        })
    } else {
        console.log(`未填写PUSH_PLUS_TOKEN\n${desp}`)
    }
}

/**
 * 主函数
 * @param {string} cookie
 * @returns {Promise<void>}
 */
function start() {
    return new Promise(resolve => {
        function createRandomDynamic() {
            Public.prototype.checkAllDynamic(GlobalVar.myUID, 1).then(Dynamic => {
                if (Dynamic.allModifyDynamicResArray[0].type === 1) {
                    Base.getPictures().then(
                        (pic) => {
                            BiliAPI.createDynamic('', pic);
                        },
                        (con) => {
                            BiliAPI.createDynamic(con);
                        }
                    )
                }
            })
        }
        let times = Base.counter();
        /* 注册事件 */
        eventBus.on('Turn_on_the_Monitor', () => {
            if (times.value() === GlobalVar.Lottery.length) {
                console.log('所有动态转发完毕');
                console.log('[运行结束]目前无抽奖信息,过一会儿再来看看吧');
                times.clear();
                createRandomDynamic()
                resolve()
                return
            }
            const lottery = GlobalVar.Lottery[times.next()];
            const nlottery = Number(lottery);
            (new Monitor(isNaN(nlottery) ? lottery : nlottery)).init();
        });
        eventBus.on('Turn_off_the_Monitor', () => {
            console.log('[运行结束]访问频繁程序自动关闭');
            createRandomDynamic()
            resolve()
        })
        eventBus.emit('Turn_on_the_Monitor');
    });
}

/**
 * 是否中奖
 */
async function isMe() {
    const MyAtInfo = await BiliAPI.getMyAtInfo();
    let MySession = await BiliAPI.getSessionInfo();
    let desp = '';
    if (MyAtInfo.length) {
        console.log('正在检查at');
        MyAtInfo.forEach(async AtInfo => {
            const { at_time, up_uname, business, source_content, url } = AtInfo
            if ((Date.now() / 1000 - at_time) / 3600 >= 2) {
                return;
            }
            desp += `发生时间: ${transformTimeZone(at_time * 1000, 8)}  <br><br>`
            desp += `用户: ${up_uname}  <br><br>`
            desp += `在${business}中@了你(${GlobalVar.myUID})  <br><br>`
            desp += `原内容为: ${source_content}  <br><br>`
            desp += `[直达链接](${url})  <br><br>`
            desp += `---------------------  <br><br>`
        });
    }
    if (MySession.data.length) {
        console.log('正在检查私信')
        let session_t = '';
        let max = 0;
        do {
            MySession.data.forEach(Session => {
                const { content, sender_uid, session_ts, timestamp } = Session;
                session_t = session_ts;
                if ((Date.now() / 1000 - timestamp) / 3600 >= 2) {
                    return;
                }
                if (/中奖|填写|写上|支付宝账号|收款码|激活码/.test(content)) {
                    desp += `发生时间: ${transformTimeZone(timestamp * 1000, 8)}  <br><br>`
                    desp += `用户: ${sender_uid}  <br><br>`
                    desp += `私信你(${GlobalVar.myUID})说: ${content}  <br><br>`
                    desp += `[直达链接](https://message.bilibili.com/#/whisper/mid${sender_uid}) <br><br>`
                    desp += `---------------------  <br><br>`
                }
            })
            if (MySession.has_more) {
                await Base.delay(3e3);
                MySession = await BiliAPI.getSessionInfo(session_t)
            }
            max++
        } while (MySession.has_more && max < 6);
    }
    if (desp !== '') {
        console.log(desp);
        ServerChan('可能中奖了!', desp);
        pushplus('可能中奖了!', desp);
    } else {
        console.log("未中奖");
    }
    return;
}

/**
 * 检查cookie是否有效
 * @param {string} num
 */
async function checkCookie(num) {
    if (await BiliAPI.getMyinfo()) {
        console.log('成功登录');
        return true;
    } else {
        console.log('登录失败');
        ServerChan('动态抽奖出错', `COOKIE${num} 已失效 UID:${GlobalVar.myUID}`);
        pushplus('动态抽奖出错', `COOKIE${num} 已失效 UID:${GlobalVar.myUID}`);
        return false;
    }
}
module.exports = {
    start,
    isMe,
    checkCookie
}